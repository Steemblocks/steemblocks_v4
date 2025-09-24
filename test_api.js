const https = require('https');

async function testAPI() {
    try {
        // Get latest irreversible block
        const globalProps = await makeRequest({
            jsonrpc: '2.0',
            method: 'condenser_api.get_dynamic_global_properties',
            params: [],
            id: 1
        });
        
        console.log('Latest irreversible block:', globalProps.result.last_irreversible_block_num);
        const latestBlock = globalProps.result.last_irreversible_block_num;
        
        // Test the last 3 blocks
        for(let i = 0; i < 3; i++) {
            const blockNum = latestBlock - i;
            console.log(`\n=== Testing Block ${blockNum} ===`);
            
            try {
                // Get virtual operations only
                const virtualOpsResult = await makeRequest({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_ops_in_block',
                    params: [blockNum, true],
                    id: 2
                });
                
                const virtualOps = virtualOpsResult.result || [];
                console.log(`Virtual ops (true parameter): ${virtualOps.length}`);
                
                // Get all operations
                const allOpsResult = await makeRequest({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_ops_in_block',
                    params: [blockNum, false],
                    id: 3
                });
                
                const allOps = allOpsResult.result || [];
                console.log(`All operations: ${allOps.length}`);
                
                // Count virtual operations manually
                const virtualOpTypes = [
                    'author_reward', 'curation_reward', 'comment_reward', 'producer_reward',
                    'interest', 'fill_convert_request', 'fill_order', 'shutdown_witness',
                    'fill_vesting_withdraw', 'hardfork_operation', 'comment_payout_update'
                ];
                
                let manualVirtualCount = 0;
                const opTypes = new Set();
                
                for(const op of allOps) {
                    if(op && op.op && op.op[0]) {
                        const opType = op.op[0];
                        opTypes.add(opType);
                        if(virtualOpTypes.includes(opType)) {
                            manualVirtualCount++;
                        }
                    }
                }
                
                console.log(`Manual virtual count: ${manualVirtualCount}`);
                console.log(`Operation types: ${Array.from(opTypes).sort().join(', ')}`);
                
                // Show some virtual operations if found
                if(virtualOps.length > 0) {
                    console.log('Virtual operations found:');
                    virtualOps.slice(0, 3).forEach((op, idx) => {
                        if(op && op.op && op.op[0]) {
                            console.log(`  ${idx + 1}. ${op.op[0]}`);
                        }
                    });
                }
                
            } catch(err) {
                console.log(`Error testing block ${blockNum}:`, err.message);
            }
        }
        
    } catch(error) {
        console.error('Error:', error.message);
    }
}

function makeRequest(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'api.steemit.com',
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch(e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.write(postData);
        req.end();
    });
}

testAPI().then(() => {
    console.log('\n✅ API test completed');
}).catch(error => {
    console.error('❌ API test failed:', error);
});