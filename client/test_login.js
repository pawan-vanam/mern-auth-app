import axios from 'axios';

const testLogin = async () => {
  try {
    console.log("Testing Login...");
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: '1pawan1760413iit@gmail.com',
      password: 'admin@123'
    });
    console.log("Response:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("Error Response Status:", error.response.status);
      console.log("Error Response Data:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
};

testLogin();
