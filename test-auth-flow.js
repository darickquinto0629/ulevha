/**
 * Test script to verify complete auth flow
 * Tests: login → verify on refresh
 */

const BASE_URL = 'http://127.0.0.1:5173';
const API_BASE = `${BASE_URL}/api`;

async function test() {
  try {
    console.log('🔷 TEST 1: Login');
    const loginResp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password'
      })
    });

    if (!loginResp.ok) {
      throw new Error(`Login failed: ${loginResp.status}`);
    }

    const loginData = await loginResp.json();
    console.log('✓ Login successful');
    console.log('  - Token:', loginData.data.token.substring(0, 40) + '...');
    console.log('  - User:', loginData.data.user.email);
    
    const token = loginData.data.token;
    console.log('');

    // Wait 100ms and then verify (simulating page refresh storing token then verifying)
    console.log('🔷 TEST 2: Verify token (simulate refresh)');
    await new Promise(r => setTimeout(r, 100));

    const verifyResp = await fetch(`${API_BASE}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Verify response status:', verifyResp.status);
    console.log('Verify response headers:', {
      'content-type': verifyResp.headers.get('content-type'),
      'access-control-allow-origin': verifyResp.headers.get('access-control-allow-origin')
    });

    if (!verifyResp.ok) {
      console.log('❌ Verify failed with status:', verifyResp.status);
      const errData = await verifyResp.json();
      console.log('Error:', errData);
      process.exit(1);
    }

    const verifyData = await verifyResp.json();
    console.log('✓ Verify successful');
    console.log('  - Success:', verifyData.success);
    console.log('  - User:', verifyData.data.email);
    console.log('');

    console.log('✅ COMPLETE AUTH FLOW WORKS');
    console.log('User stays logged in on refresh ✓');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

test();
