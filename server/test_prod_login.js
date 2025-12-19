const axios = require("axios");

async function testLogin() {
  try {
    console.log(
      "Testing connection to https://mern-auth-server-ko0r.onrender.com/api/auth/login"
    );
    const res = await axios.post(
      "https://mern-auth-server-ko0r.onrender.com/api/auth/login",
      {
        email: "test@example.com",
        password: "password",
      }
    );
    console.log("Success:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("Server Responded with Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    } else if (error.request) {
      console.log("No Response received:", error.message);
    } else {
      console.log("Error setup:", error.message);
    }
  }
}

testLogin();
