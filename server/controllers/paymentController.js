const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const qs = require('qs'); // Ensure qs is available or use URLSearchParams
const Payment = require('../models/Payment');
const { sendCourseEnrollmentMessage } = require('../utils/whatsapp');
const User = require('../models/User'); // Need User model to get profile/phone

// CREDENTIALS
// V2 typically needs the RAW Key for OAuth, not decoded.
// If the user provided "Y2Y2...", that is likely the secret they should send.
const MERCHANT_ID = process.env.PHONEPE_CLIENT_ID || "PGTESTPAYUAT";
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || 1;
const HOST_URL = process.env.PHONEPE_HOST_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

const { initializeCourseFolders } = require('../utils/fileSystem');

/**
 * Step 1: Generate Authorization Token
 * POST /v1/oauth/token
 */
const getAuthToken = async () => {
    try {
        const data = qs.stringify({
            'client_id': MERCHANT_ID,
            'client_version': CLIENT_VERSION,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'client_credentials'
        });

        console.log("-> Requesting OAuth Token...");
        console.log("   Client ID:", MERCHANT_ID);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${HOST_URL}/v1/oauth/token`,
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(config);
        console.log("-> OAuth Token Received");
        return response.data.access_token;

    } catch (error) {
        console.error("!! OAuth Token Error !!");
        console.error(error.response ? error.response.data : error.message);
        throw new Error("Failed to authenticate with PhonePe");
    }
};

/**
 * Step 2: Create Payment
 * POST /checkout/v2/pay
 */
exports.initiatePayment = async (req, res) => {
    try {
        const { amount } = req.body; 
        const userId = req.user.id; // From auth middleware

        if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

        // 1. Get Token
        const accessToken = await getAuthToken();

        // 2. Prepare Payload
        const merchantOrderId = uuidv4().slice(0, 30);
        
        // 3. Create Pending Payment Record in DB
        await Payment.create({
            userId,
            merchantTransactionId: merchantOrderId,
            amount,
            status: 'PENDING'
        });
        
        console.log(`-> Created PENDING payment record for user: ${userId}`);

        const requestData = {
            merchantOrderId: merchantOrderId,
            amount: amount * 100, // paise
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment for Order",
                merchantUrls: {
                    // Redirect to Backend first to handle POST data
                    // Append jobId to ensure we have the ID even if POST body is lost (GET redirect)
                    // Use production URL if in production
                    redirectUrl: `${process.env.API_URL || 'http://localhost:5000/api'}/payment/redirect?jobId=${merchantOrderId}`
                }
            }
        };

        console.log("-> Initiating V2 Payment...");
        
        const response = await axios.post(
            `${HOST_URL}/checkout/v2/pay`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `O-Bearer ${accessToken}`
                }
            }
        );

        console.log("-> Payment Session Created:", response.data.state);

        if (response.data && response.data.redirectUrl) {
            res.status(200).json({
                success: true,
                url: response.data.redirectUrl,
                merchantTransactionId: merchantOrderId
            });
        } else {
             res.status(500).json({ success: false, message: 'No redirect URL returned', details: response.data });
        }

    } catch (error) {
        console.error("PhonePe V2 Payment Error:");
        const errorData = error.response ? error.response.data : error.message;
        console.error(JSON.stringify(errorData, null, 2));
        
        res.status(error.response ? error.response.status : 500).json({ 
            success: false, 
            message: errorData.message || 'Payment initiation failed',
            details: errorData
        });
    }
};

/**
 * Handle Redirect from PhonePe (POST)
 * POST /redirect
 */
exports.handleRedirect = (req, res) => {
    console.log(`-> PhonePe Redirect Received (${req.method})`);
    
    // Check both body (POST) and query (GET) for parameters
    const data = req.method === 'GET' ? req.query : req.body;
    console.log("Data:", data);

    let { code, merchantOrderId, transactionId, providerReferenceId } = data;

    // Fallback: If POST body is lost/missing, check query params for our manual 'jobId'
    const manualOrderId = req.query.jobId;
    
    // Choose the ID available
    const orderId = merchantOrderId || transactionId || manualOrderId;

    // If code is missing (e.g. GET redirect), default to 'VERIFY' so frontend tries to check status
    if (!code) {
        code = 'VERIFY';
    }

    // Construct Frontend URL with Query Params
    // Ensure we don't pass 'undefined' strings
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const frontendUrl = `${clientUrl}/dashboard?code=${code || ''}&merchantOrderId=${orderId || ''}&providerId=${providerReferenceId || ''}`;

    console.log("-> Redirecting to Frontend:", frontendUrl);
    res.redirect(frontendUrl);
};

/**
 * Check Status (V2)
 * GET /checkout/v2/order/{merchantOrderId}/status
 */
exports.checkStatus = async (req, res) => {
    try {
        const { merchantTransactionId } = req.body;
        if (!merchantTransactionId) return res.status(400).json({ message: "Transaction ID required" });

        const accessToken = await getAuthToken();

        console.log("-> Checking Status for:", merchantTransactionId);

        const response = await axios.get(
            `${HOST_URL}/checkout/v2/order/${merchantTransactionId}/status`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `O-Bearer ${accessToken}`,
                    // Documentation says X-MERCHANT-ID might be needed for partners, likely not for direct
                }
            }
        );

        const paymentStatus = response.data?.state; // 'COMPLETED', 'FAILED', etc.

        // Find and Update Payment Record in DB
        const payment = await Payment.findOne({ merchantTransactionId });
        
        console.log(`-> DEBUG: Searching for Payment ID: ${merchantTransactionId}`);
        console.log(`-> DEBUG: Payment Record Found: ${payment ? 'YES' : 'NO'}`);

        if (payment) {
            const previousStatus = payment.status;

            payment.status = paymentStatus === 'COMPLETED' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED';
            payment.paymentDetails = response.data;
            await payment.save();
            console.log(`-> Updated Payment DB Status: ${payment.status}`);

            // NEW: Send WhatsApp Message if successful and NOT already sent
            // Only send if we are transitioning to success for the first time
            if (paymentStatus === 'COMPLETED' && previousStatus !== 'PAYMENT_SUCCESS') {
                try {
                    // Fetch User to get Name and (if stored) Phone
                    const user = await User.findById(payment.userId); 
                    
                    // Send Email Notification
                    const { sendCourseEnrollmentEmail } = require('../utils/email');
                    await sendCourseEnrollmentEmail(user.email, user.name, "Full Stack Web Development", payment.merchantTransactionId, payment.amount);
                    console.log(`-> Sent Payment Success Email to ${user.email}`);

                    // Initialize Course Folders (Data/User/Course/Steps)
                    initializeCourseFolders(user.name, "Full Stack Web Development");

                    // Since we didn't setup virtuals yet, let's fetch Profile manually
                    const Profile = require('../models/Profile');
                    const profile = await Profile.findOne({ user: payment.userId });

                    let phone = profile?.phoneNumber;
                    const name = user.name;
                    
                    // Fallback to a default number or check if phone exists
                    if (phone) {
                        // Ensure phone has country code for WhatsApp (defaulting to 91 if 10 digits)
                        if (phone.length === 10) phone = '91' + phone; 
                        
                        console.log(`-> Sending WhatsApp to ${name} at ${phone}`);
                        await sendCourseEnrollmentMessage(phone, name, "Full Stack Web Development");
                    } else {
                        console.log("-> No phone number found for user, skipping WhatsApp message.");
                    }
                } catch (msgErr) {
                    console.error("-> Failed to trigger Notifications:", msgErr);
                }
            }
        }

        if (response.data && response.data.state === 'COMPLETED') {
             res.status(200).json({ success: true, message: 'Payment Successful', data: response.data });
        } else {
             res.status(200).json({ success: false, message: 'Payment Pending or Failed', data: response.data });
        }

    } catch (error) {
        console.error('Status Check Error:', error.message);
        res.status(500).json({ success: false, message: 'Status check failed', error: error.message });
    }
}

/**
 * Get User Payment Status
 * GET /user-status
 */
exports.getUserPaymentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the most recent successful payment
        const payment = await Payment.findOne({ 
            userId, 
            status: 'PAYMENT_SUCCESS' 
        }).sort({ createdAt: -1 });

        if (payment) {
            return res.status(200).json({ 
                isPaid: true, 
                payment 
            });
        }

        res.status(200).json({ isPaid: false });

    } catch (error) {
        console.error('User Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
