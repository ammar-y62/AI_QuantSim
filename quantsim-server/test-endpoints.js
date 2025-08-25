const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials from previous registration
const TEST_USER = {
  uid: 'PveHQBNGvvMPRkKthopipfcTtXv1',
  email: 'test@example.com',
  displayName: 'Test User'
};

// Test function
async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    console.log(`\nTesting: ${name}`);
    console.log(`${method.toUpperCase()} ${url}`);
    
    let response;
    if (method === 'GET') {
      response = await axios.get(url, { headers });
    } else if (method === 'POST') {
      response = await axios.post(url, data, { headers });
    } else if (method === 'PUT') {
      response = await axios.put(url, data, { headers });
    } else if (method === 'DELETE') {
      response = await axios.delete(url, { headers });
    }
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`Error Response:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Test authenticated endpoints with user context
async function testAuthenticatedEndpoints() {
  console.log('\nTesting Authenticated Endpoints with User Context...');
  
  // For testing purposes, we'll simulate the auth flow
  // In a real scenario, the frontend would:
  // 1. Use customToken to sign in with Firebase
  // 2. Get an ID token from Firebase
  // 3. Send that ID token to our backend
  
  // Test 1: Get user profile
  await testEndpoint('Get User Profile', 'GET', `${BASE_URL}/auth/profile/${TEST_USER.uid}`);
  
  // Test 2: Add stock to portfolio
  await testEndpoint('Add Stock to Portfolio', 'POST', `${BASE_URL}/portfolio/add`, {
    ticker: 'AAPL',
    shares: 10,
    avgPrice: 200.00,
    portfolioName: 'Test Portfolio'
  });
  
  // Test 3: Get user portfolio
  await testEndpoint('Get User Portfolio', 'GET', `${BASE_URL}/portfolio/userPortfolio`);
  
  // Test 4: Get basic portfolio
  await testEndpoint('Get Basic Portfolio', 'GET', `${BASE_URL}/portfolio/portfolio`);
  
  // Test 5: Get dashboard for user
  await testEndpoint('Get User Dashboard', 'GET', `${BASE_URL}/dashboard/${TEST_USER.uid}`);
  
  // Test 6: Update stock in portfolio
  await testEndpoint('Update Stock in Portfolio', 'PUT', `${BASE_URL}/portfolio/AAPL`, {
    shares: 15,
    avgPrice: 205.00
  });
  
  // Test 7: Save portfolio (add/update stock)
  await testEndpoint('Save Portfolio', 'POST', `${BASE_URL}/portfolio/save`, {
    ticker: 'MSFT',
    shares: 5,
    avgPrice: 350.00,
    portfolioName: 'Test Portfolio'
  });
  
  // Test 8: Remove stock from portfolio
  await testEndpoint('Remove Stock from Portfolio', 'DELETE', `${BASE_URL}/portfolio/MSFT`);
}

// Main test function
async function runTests() {
  console.log('Starting Endpoint Tests...\n');
  
  // Test 1: Basic health check
  await testEndpoint('Health Check', 'GET', `${BASE_URL}/ping`);
  
  // Test 2: Stock search
  await testEndpoint('Stock Search', 'GET', `${BASE_URL}/stocks/search?q=AAPL`);
  
  // Test 3: Stock list
  await testEndpoint('Stock List', 'GET', `${BASE_URL}/stocks/list?limit=3`);
  
  // Test 4: Stock history
  await testEndpoint('Stock History', 'GET', `${BASE_URL}/stocks/AAPL/history?period=1d`);
  
  // Test 5: Auth endpoints
  console.log('\nTesting Auth Endpoints...');
  await testEndpoint('User Registration', 'POST', `${BASE_URL}/auth/register`, {
    email: 'test2@example.com',
    password: 'password123',
    displayName: 'Test User 2'
  });
  
  // Test 6: Authenticated endpoints (will fail without proper JWT)
  console.log('\nTesting Portfolio & Dashboard Endpoints (Expected to fail without JWT)...');
  await testAuthenticatedEndpoints();
  
  console.log('\nEndpoint testing completed!');
  console.log('\nNote: Authenticated endpoints failed because they need Firebase ID tokens, not custom tokens.');
  console.log('   In a real frontend app, you would:');
  console.log('   1. Use the customToken to sign in with Firebase');
  console.log('   2. Get an ID token from Firebase');
  console.log('   3. Include that ID token in the Authorization header');
}

// Run tests
runTests().catch(console.error);
