const nodemailer = require('nodemailer');

const sendCourseEnrollmentEmail = async (toEmail, userName, courseName, orderId, amount) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fee7; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #bef264; }
    .logo-text { font-size: 24px; font-weight: bold; color: #3f6212; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; color: #374151; }
    .welcome-text { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #1a2e05; text-align: center; }
    .message { line-height: 1.6; color: #4b5563; margin-bottom: 30px; font-size: 16px; }
    
    /* Receipt Box Styling */
    .receipt-box { background-color: #ecfccb; border: 1px solid #d9f99d; border-radius: 12px; padding: 25px; margin-bottom: 30px; }
    
    /* Using Table for Layout to prevent merging */
    .receipt-table { width: 100%; border-collapse: collapse; }
    .receipt-table td { padding: 10px 0; vertical-align: top; }
    .label { color: #4d7c0f; font-weight: 500; width: 40%; }
    .value { color: #1a2e05; font-weight: 600; text-align: right; width: 60%; }
    .divider td { border-top: 1px dashed #84cc16; padding-top: 15px; margin-top: 5px; }
    .total-label { color: #365314; font-size: 18px; font-weight: 700; }
    .total-value { color: #365314; font-size: 18px; font-weight: 700; }

    .cta-button { 
      display: block; 
      width: 100%; 
      text-align: center; 
      background-color: #65a30d; 
      color: #ffffff !important; 
      text-decoration: none; 
      padding: 16px 0; 
      border-radius: 10px; 
      font-weight: 600; 
      font-size: 16px;
      margin-top: 20px; 
      transition: background-color 0.3s ease; 
    }
    .cta-button:hover { background-color: #4d7c0f; }
    
    .footer { background-color: #f7fee7; padding: 20px; text-align: center; font-size: 12px; color: #65a30d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">ZAMANAT Tech Solutions Pvt. Ltd.</div>
    </div>
    <div class="content">
      <div class="welcome-text">Success! You're Enrolled 🚀</div>
      <p class="message">Hi <strong>${userName}</strong>,<br>
      Thank you for your purchase. We are thrilled to welcome you to the course. Your payment has been successfully processed.</p>
      
      <div class="receipt-box">
        <table class="receipt-table">
          <tr>
            <td class="label">Order ID</td>
            <td class="value">#${orderId}</td>
          </tr>
          <tr>
            <td class="label">Course</td>
            <td class="value">${courseName}</td>
          </tr>
          <tr>
            <td class="label">Date</td>
            <td class="value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr class="divider">
            <td class="total-label">Total Paid</td>
            <td class="total-value">₹${amount}</td>
          </tr>
        </table>
      </div>

      <p class="message" style="text-align: center; font-size: 14px;">
        Ready to start learning? Click below to access your dashboard.
      </p>

      <a href="http://localhost:5173/dashboard" class="cta-button">Go to Dashboard</a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Zamanat Tech Solutions Pvt. Ltd. All rights reserved.<br>
      Empowering Innovation, Ensuring Success
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: `Payment Receipt: ${courseName}`,
      html: htmlTemplate,
    });

    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback logging for development
    console.log("----------------------------------------------------");
    console.log("Email send failed (logging to console):");
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Payment Receipt: ${courseName}`);
    console.log("----------------------------------------------------");
  }
};

module.exports = { sendCourseEnrollmentEmail };
