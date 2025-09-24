// Simple test script to check the witness API
const axios = require('axios');

async function testWitnessAPI() {
    console.log('Testing witness ranking API...');
    
    try {
        const response = await axios.get('https://steemyy.com/api/steemit/ranking/', {
            timeout: 10000
        });
        
        console.log(`✅ API Response Status: ${response.status}`);
        console.log(`✅ Data Type: ${typeof response.data}`);
        console.log(`✅ Is Array: ${Array.isArray(response.data)}`);
        console.log(`✅ Data Length: ${response.data?.length || 'N/A'}`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log('✅ First witness data sample:');
            console.log(JSON.stringify(response.data[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.code) {
            console.error('❌ Error Code:', error.code);
        }
        if (error.response) {
            console.error('❌ Response Status:', error.response.status);
            console.error('❌ Response Data:', error.response.data);
        }
    }
}

async function testSteemAPI() {
    console.log('\nTesting Steem API for active witnesses...');
    
    try {
        const response = await axios.post('https://api.steemit.com', {
            jsonrpc: "2.0",
            method: "condenser_api.get_active_witnesses",
            params: [],
            id: 1
        }, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`✅ Steem API Response Status: ${response.status}`);
        console.log(`✅ Has Result: ${!!response.data.result}`);
        console.log(`✅ Active Witnesses Count: ${response.data.result?.length || 'N/A'}`);
        
        if (response.data.result && response.data.result.length > 0) {
            console.log('✅ First few active witnesses:', response.data.result.slice(0, 5));
        }
        
    } catch (error) {
        console.error('❌ Steem API Error:', error.message);
    }
}

// Run the tests
testWitnessAPI().then(() => {
    return testSteemAPI();
}).then(() => {
    console.log('\n✅ API tests completed');
});