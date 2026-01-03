const axios = require('axios');

const sendCourseEnrollmentMessage = async (to, userName, courseName) => {
    try {
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_TOKEN;
        
        if (!phoneId || !token) {
            console.warn('WhatsApp credentials not found in .env. Skipping message send.');
            return;
        }

        const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

        // Using a standard free-form message for simplicity/testing since templates require approval
        // For production, you MUST use templates for user-initiated conversations
        const data = {
            messaging_product: 'whatsapp',
            to: to, // Must be in E.164 format (e.g., 919876543210)
            type: 'text',
            text: {
                body: `Hello ${userName}! \n\nCongratulations on enrolling in the "${courseName}"! \n\nWe are excited to have you on board. Your payment has been successfully received.\n\nHappy Learning!\nTeam Zamanat`
            }
        };

        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('WhatsApp message sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
        // Don't throw, just log, so payment flow doesn't break
    }
};

module.exports = { sendCourseEnrollmentMessage };
