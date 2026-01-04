// Script to setup admin account
const fetch = require('node-fetch');

async function setupAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'daddycallmehome@gmail.com',
        password: 'admin'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin account setup successful!');
      console.log('Email:', data.admin.email);
      console.log('Name:', data.admin.name);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to setup admin:', error.message);
    console.log('Make sure the dev server is running on port 3000');
  }
}

setupAdmin();


