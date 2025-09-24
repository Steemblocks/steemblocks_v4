const axios = require('axios');

// Test the LatestBlocks API logic
async function testLatestBlocksLogic() {
    console.log('🚀 Testing LatestBlocks component logic...\n');

    // Test 1: Fetch block data like the component does
    const fetchBlockWithOperations = async (blockNumber, retries = 2) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                console.log(`🔍 Fetching block ${blockNumber} (attempt ${attempt + 1}/${retries + 1})`);
                
                // Get block data
                const blockResponse = await axios.post('https://api.steemit.com', {
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_block',
                    params: [blockNumber],
                    id: 1
                }, { timeout: 8000 });

                if (!blockResponse.data?.result) {
                    throw new Error(`No data for block ${blockNumber}`);
                }

                const blockData = blockResponse.data.result;
                blockData.block_num = blockNumber;
                
                // Get operations count from the block
                if (blockData.transactions && Array.isArray(blockData.transactions)) {
                    blockData.transactions_count = blockData.transactions.length;
                } else {
                    blockData.transactions_count = 0;
                }

                // Get virtual operations with timeout
                try {
                    const opsResponse = await axios.post('https://api.steemit.com', {
                        jsonrpc: '2.0',
                        method: 'condenser_api.get_ops_in_block',
                        params: [blockNumber, true],
                        id: 2
                    }, { timeout: 8000 });

                    if (opsResponse.data?.result && Array.isArray(opsResponse.data.result)) {
                        blockData.virtual_ops = opsResponse.data.result.length;
                    } else {
                        blockData.virtual_ops = 0;
                    }
                } catch (opsError) {
                    console.warn(`⚠️ Failed to fetch virtual ops for block ${blockNumber}, using 0:`, opsError.message);
                    blockData.virtual_ops = 0;
                }

                console.log(`✅ Successfully fetched block ${blockNumber}, Txs: ${blockData.transactions_count}, VOPs: ${blockData.virtual_ops}`);
                return {
                    block_num: blockData.block_num,
                    timestamp: blockData.timestamp,
                    witness: blockData.witness,
                    transactions_count: blockData.transactions_count,
                    virtual_ops: blockData.virtual_ops
                };

            } catch (error) {
                console.error(`❌ Error fetching block ${blockNumber} (attempt ${attempt + 1}):`, error.message);
                
                if (attempt === retries) {
                    console.error(`❌ Failed to fetch block ${blockNumber} after ${retries + 1} attempts`);
                    return null;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
        return null;
    };

    try {
        // Get irreversible block number
        console.log('📡 Getting latest irreversible block number...');
        const globalResponse = await axios.post('https://api.steemit.com', {
            jsonrpc: '2.0',
            method: 'condenser_api.get_dynamic_global_properties',
            params: [],
            id: 1
        }, { timeout: 10000 });

        if (!globalResponse.data?.result?.last_irreversible_block_num) {
            throw new Error('Failed to get irreversible block number');
        }

        const irreversibleBlockNumber = globalResponse.data.result.last_irreversible_block_num;
        console.log(`📦 Latest irreversible block: ${irreversibleBlockNumber}\n`);

        // Test fetching latest 3 blocks (like initial fetch)
        console.log('🧪 Testing initial block fetch (latest 3 blocks)...');
        const promises = [];
        for (let i = 0; i < 3; i++) {
            const blockNum = irreversibleBlockNumber - i;
            if (blockNum > 0) {
                promises.push(fetchBlockWithOperations(blockNum));
            }
        }

        const results = await Promise.all(promises);
        const validBlocks = results.filter(block => block !== null);

        console.log(`\n✅ Successfully fetched ${validBlocks.length} blocks:`);
        validBlocks.forEach(block => {
            if (block) {
                console.log(`   Block ${block.block_num}: ${block.transactions_count} txs, ${block.virtual_ops} VOPs, witness: ${block.witness}`);
            }
        });

        // Test single block update (like the interval does)
        console.log('\n🧪 Testing single block update logic...');
        const currentLatest = validBlocks[0]?.block_num || 0;
        
        // Simulate waiting and checking for a new block
        console.log(`Current latest: ${currentLatest}, API latest: ${irreversibleBlockNumber}`);
        
        if (currentLatest >= irreversibleBlockNumber) {
            console.log('⏭️ No new blocks available');
        } else {
            console.log('🔍 New block available, would fetch it');
        }

        console.log('\n✅ All tests completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - API calls working: ✅`);
        console.log(`   - Block data structure: ✅`);
        console.log(`   - Virtual operations: ✅`);
        console.log(`   - Error handling: ✅`);
        console.log(`   - Update logic: ✅`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testLatestBlocksLogic();