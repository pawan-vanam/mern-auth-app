const axios = require('axios');

async function checkHeaders() {
    try {
        console.log('--- Testing Login Headers ---');
        const response = await axios.post('https://mern-auth-server-ko0r.onrender.com/api/auth/login', 
            {
                email: 'vanampawan27@gmail.com',
                password: 'admin@123'
            },
            {
                headers: {
                    'Origin': 'https://zamanat-auth-app.netlify.app',
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );

        console.log('Status:', response.status);
        console.log('Set-Cookie Header:', JSON.stringify(response.headers['set-cookie'], null, 2));

    } catch (error) {
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Set-Cookie Header:', JSON.stringify(error.response.headers['set-cookie'], null, 2));
            console.log('Data:', error.response.data);
        }
    }
}

checkHeaders();
