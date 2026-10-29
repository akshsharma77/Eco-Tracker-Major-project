async function test() {
  try {
    const payload = {
      name: 'Test Worker',
      email: 'testworker99@ecotrack.gov',
      password: 'password123',
      mobileNumber: '1234567890',
      location: { address: '123 Test St', city: 'Test City', state: 'TS', pincode: '12345' },
      workerDetails: { workerType: 'Collector', assignedArea: 'Zone A', shiftPreference: 'Morning' }
    };

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecotrack.gov',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log("Login failed:", loginData);
      return;
    }
    const token = loginData.token;
    
    const res = await fetch('http://localhost:5000/api/users/workers', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      console.log("Success:", data);
    } catch (e) {
      console.log("Server returned non-JSON:", text);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
