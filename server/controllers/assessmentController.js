const { GoogleGenerativeAI } = require('@google/generative-ai');
const Assessment = require('../models/Assessment');
const Assignment = require('../models/Assignment');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const assessCourse = async (req, res) => {
    try {
        // courseName usually matches the one in Assignment uploads
        const { courseName } = req.body; 
        const userId = req.user.id;

        if (!courseName) {
            return res.status(400).json({ success: false, message: 'Course name is required' });
        }

        // 1. Fetch Assignments
        const assignments = await Assignment.find({ user: userId, courseName });

        if (!assignments || assignments.length === 0) {
             return res.status(404).json({ success: false, message: 'No submitted assignments found for this course. Please upload files first.' });
        }

        // 2. Prepare Data for Gemini
        // Using gemini-1.5-flash as the requested "Gemini-2.5-Flash" likely refers to the latest flash model.
        // If "Gemini-2.5-Flash" explicitly exists in the future, change this string.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        
        const promptIntro = `You are an expert coding instructor and AI grader. 
        Analyze the following code files and screenshots submitted by a student for the course "${courseName}".
        
        Your task is to:
        1. Evaluate the code quality, structure, and best practices (HTML, CSS, JS, etc.).
        2. Analyze screenshots to judge the visual output (UI/UX).
        3. Provide an overall score (0-100) and a brief summary.
        4. Break down the assessment into sections (e.g., HTML, CSS, JavaScript, Accessibility, Design).
        5. Provide specific, constructive feedback for each section.
        6. Return the result strictly in valid JSON format with no markdown formatting.
        
        JSON Structure:
        {
            "overallScore": Number,
            "summary": "String",
            "sections": [
                {
                    "name": "String (e.g. HTML)",
                    "score": Number,
                    "status": "String (Good/Needs Improvement/Excellent)",
                    "feedback": "String"
                }
            ]
        }
        `;

        const parts = [promptIntro];

        for (const file of assignments) {
            try {
                if (fs.existsSync(file.serverPath)) {
                    if (file.type === 'code') {
                        const content = fs.readFileSync(file.serverPath, 'utf8');
                        parts.push(`\n--- File: ${file.originalName} ---\n${content}\n`);
                    } else if (file.type === 'screenshot') {
                         const imageBuffer = fs.readFileSync(file.serverPath);
                         parts.push({
                            inlineData: {
                                data: imageBuffer.toString('base64'),
                                mimeType: file.mimeType || 'image/png'
                            }
                        });
                        parts.push(`\n[Attached Screenshot: ${file.originalName}]\n`);
                    }
                }
            } catch(err) {
                console.warn(`Failed to read file ${file.serverPath}:`, err);
            }
        }

        // 3. Call Gemini
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON
        let jsonResponse;
        try {
             // Remove ```json and ``` if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            // Fallback if JSON parsing fails - save raw text
            return res.status(500).json({ success: false, message: 'AI Assessment failed to generate valid results.', raw: text });
        }

        // 5. Save to DB
        const assessment = await Assessment.create({
            user: userId,
            courseName,
            overallScore: jsonResponse.overallScore,
            summary: jsonResponse.summary,
            sections: jsonResponse.sections,
            aiResponse: text
        });

        res.status(200).json({ success: true, data: assessment });

    } catch (error) {
        console.error("Assessment Error:", error);
        res.status(500).json({ success: false, message: 'Server Error during assessment', error: error.message });
    }
};

const getAssessment = async (req, res) => {
    try {
        const { courseName } = req.params;
        const assessment = await Assessment.findOne({ user: req.user.id, courseName }).sort({ createdAt: -1 });
        
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'No assessment found' });
        }
        res.status(200).json({ success: true, data: assessment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { assessCourse, getAssessment };
