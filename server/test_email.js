const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function testEmail() {
  console.log('Testing with user:', process.env.EMAIL_USER);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: 'test@example.com',
      subject: 'Test Email from ZAMANAT',
      text: 'If you see this, email sending is working!',
    });
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
