import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AccountLink from './AccountLink';
import Loading from './Loading';

const IrreversibleBlocksTable = ({
  showHeader = true,
  blockCount = 10,
  className = '',
  isLive = false,
  onUpdate = null
}) => {
  // State management
  const [irreversibleBlocks, setIrreversibleBlocks] = useState([]);
  const [irreversibleLoading, setIrreversibleLoading] = useState(true);
  const [irreversibleError, setIrreversibleError] = useState(null);
  const [witnessImages, setWitnessImages] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [newIrreversibleBlockIds] = useState(new Set());

  // Use refs to prevent infinite loops and manage intervals
  const isInitializedRef = useRef(false);
  const intervalRef = useRef(null);

  // Fetch witness profile images
  const fetchWitnessImages = useCallback(async (witnesses) => {
    if (!witnesses || witnesses.length === 0) return;

    const newImages = {};
    witnesses.forEach((witness) => {
      newImages[witness] = `https://steemitimages.com/u/${witness}/avatar/small`;
    });

    setWitnessImages(prev => ({ ...prev, ...newImages }));
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';

    // Handle Steem API timestamp format: "2025-09-17T17:20:45"
    const timestampWithZ = timestamp + (timestamp.includes('Z') ? '' : 'Z');
    const blockTime = new Date(timestampWithZ);
    const now = new Date();
    const diffMs = now - blockTime;
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Helper function to fetch complete block data using get_ops_in_block
  const fetchBlockWithOps = useCallback(async (blockNum, fallbackWitness = 'N/A') => {
    try {
      // First get the basic block data
      const blockResponse = await axios.post("https://api.steemit.com", {
        jsonrpc: "2.0",
        method: "condenser_api.get_block",
        params: [blockNum],
        id: 1
      }, { timeout: 10000 });

      const blockData = blockResponse.data?.result;
      if (!blockData) {
        return null;
      }

      // Get virtual operations in this block
      const virtualOpsResponse = await axios.post("https://api.steemit.com", {
        jsonrpc: "2.0",
        method: "condenser_api.get_ops_in_block",
        params: [blockNum, true],
        id: 3
      }, { timeout: 10000 });

      const virtualOps = virtualOpsResponse.data?.result || [];

      const transactionCount = blockData.transactions ? blockData.transactions.length : 0;
      const virtualOpCount = virtualOps.length;
      const blockWitness = blockData.witness || fallbackWitness;
      const blockTimestamp = blockData.timestamp;

      const blockInfo = {
        BlockNumber: blockNum,
        Number: blockNum,
        Witness: blockWitness,
        Transactions: transactionCount,
        VirtualOps: virtualOpCount,
        Timestamp: blockTimestamp,
        TimeAgo: formatTimeAgo(blockTimestamp)
      };

      return blockInfo;
    } catch (error) {
      console.error(`Error fetching block ${blockNum} with ops:`, error);
      return null;
    }
  }, []);

  // Fetch irreversible blocks (complete data with virtual ops)
  const fetchIrreversibleBlocks = useCallback(async (irreversibleBlockNumber, isUpdate = false) => {
    try {
      const promises = [];
      for (let i = 0; i < blockCount; i++) {
        const blockNum = irreversibleBlockNumber - i;
        if (blockNum > 0) {
          const promise = new Promise(resolve => {
            setTimeout(async () => {
              const result = await fetchBlockWithOps(blockNum);
              resolve(result);
            }, i * 100); // 100ms delay between requests
          });
          promises.push(promise);
        }
      }

      const results = await Promise.all(promises);
      const validBlocks = results.filter(block => block !== null);
      const sortedBlocks = validBlocks.sort((a, b) => b.Number - a.Number);

      if (sortedBlocks.length > 0) {
        // Add blocks one by one with animation timing
        if (isUpdate) {
          // For live updates, just add new blocks normally
          setIrreversibleBlocks(sortedBlocks);
        } else {
          // For initial load, add blocks sequentially with animation
          setIrreversibleBlocks([]);

          // Add blocks one by one with proper timing
          const addBlockSequentially = (blockIndex) => {
            if (blockIndex >= sortedBlocks.length) return;

            const block = sortedBlocks[blockIndex];
            setIrreversibleBlocks(prevBlocks => [...prevBlocks, { ...block, isNewBlock: true }]);

            // Remove animation flag after animation completes
            setTimeout(() => {
              setIrreversibleBlocks(currentBlocks =>
                currentBlocks.map(b =>
                  b.BlockNumber === block.BlockNumber ? { ...b, isNewBlock: false } : b
                )
              );
            }, 800);

            // Add next block
            setTimeout(() => addBlockSequentially(blockIndex + 1), 250);
          };

          addBlockSequentially(0);
        }

        // Fetch witness images
        const witnesses = [...new Set(sortedBlocks.map(block => block.Witness))];
        fetchWitnessImages(witnesses);

        setLastUpdateTime(new Date().toISOString());
        if (onUpdate) {
          onUpdate(sortedBlocks);
        }
      }

    } catch (error) {
      console.error('Error fetching irreversible blocks:', error);
      setIrreversibleError('Failed to fetch irreversible blocks');
    } finally {
      if (!isUpdate) {
        setIrreversibleLoading(false);
      }
    }
  }, [blockCount, fetchBlockWithOps, fetchWitnessImages, onUpdate]);

  // Initialize and setup live updates
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeBlocks = async () => {
      try {
        setIrreversibleLoading(true);
        setIrreversibleError(null);

        // Get the latest irreversible block number
        const globalPropsResponse = await axios.post("https://api.steemit.com", {
          jsonrpc: "2.0",
          method: "condenser_api.get_dynamic_global_properties",
          params: [],
          id: 1
        }, { timeout: 10000 });

        const globalProps = globalPropsResponse.data?.result;
        if (!globalProps?.last_irreversible_block_num) {
          throw new Error('Failed to get global properties');
        }

        const irreversibleBlockNumber = globalProps.last_irreversible_block_num;
        await fetchIrreversibleBlocks(irreversibleBlockNumber);

        // Setup live updates if enabled
        if (isLive && !intervalRef.current) {
          intervalRef.current = setInterval(async () => {
            try {
              const response = await axios.post("https://api.steemit.com", {
                jsonrpc: "2.0",
                method: "condenser_api.get_dynamic_global_properties",
                params: [],
                id: 1
              }, { timeout: 5000 });

              const props = response.data?.result;
              if (props?.last_irreversible_block_num) {
                await fetchIrreversibleBlocks(props.last_irreversible_block_num, true);
                setLastUpdateTime(new Date().toISOString());
              }
            } catch (error) {
              console.error('Error in live update:', error);
            }
          }, 3000); // Update every 3 seconds for better responsiveness
        }

      } catch (error) {
        console.error('Initialization error:', error);
        setIrreversibleError('Failed to initialize irreversible blocks');
        setIrreversibleLoading(false);
      }
    };

    initializeBlocks();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLive, fetchIrreversibleBlocks]);

  if (irreversibleError) {
    return (
      <div className={`latest-blocks-container ${className}`}>
        {showHeader && (
          <div className="section-header">
            <div className="section-header-info">
              <h2>Irreversible Blocks</h2>
              <p>Last {blockCount} confirmed irreversible blocks with complete transaction and virtual operation data</p>
            </div>
          </div>
        )}
        <div className="latest-blocks-error-message">
          <span className="error-icon">⚠️</span>
          {irreversibleError}
        </div>
      </div>
    );
  }

  if (irreversibleLoading || irreversibleBlocks.length === 0) {
    return (
      <div className={`latest-blocks-container ${className}`}>
        {showHeader && (
          <div className="section-header">
            <div className="section-header-info">
              <h2>Irreversible Blocks</h2>
              <p>Last {blockCount} confirmed irreversible blocks with complete transaction and virtual operation data</p>
            </div>
          </div>
        )}
        <div className="latest-blocks-loading-container">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={`latest-blocks-container ${className}`}>
      {showHeader && (
        <div className="section-header">
          <div className="section-header-info">
            <h2>Irreversible Blocks</h2>
            <p>Last {blockCount} confirmed irreversible blocks with complete transaction and virtual operation data</p>
          </div>
          {isLive && lastUpdateTime && (
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>LIVE</span>
              <span className="last-update">
                Updated: {new Date(lastUpdateTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="latest-blocks-list">
        {irreversibleBlocks.map((block, index) => {
          const isNewBlock = block.isNewBlock || newIrreversibleBlockIds.has(block.BlockNumber);

          return (
            <div
              key={`irreversible-${block.BlockNumber}-${index}`}
              className={`block-item ${isNewBlock ? 'new-block-entering' : ''}`.trim()}
            >
              <div className="block-item-content">
                <div className="block-main-info">
                  <div className="block-number-section">
                    <Link to={`/blocks/${block.BlockNumber}`} className="block-number-link">
                      <span className="block-number">#{block.BlockNumber}</span>
                    </Link>
                    <span className="block-label">Block Number</span>
                  </div>

                  <div className="witness-section">
                    <img
                      src={witnessImages[block.Witness] || `https://steemitimages.com/u/${block.Witness}/avatar/small`}
                      alt={`${block.Witness} avatar`}
                      className="witness-avatar"
                      onError={(e) => {
                        e.target.src = `https://steemitimages.com/u/${block.Witness}/avatar/small`;
                      }}
                    />
                    <div className="witness-details">
                      <span className="witness-label">Witness</span>
                      <AccountLink
                        account={block.Witness}
                        showAt={false}
                        className="witness-name"
                      />
                    </div>
                  </div>

                  <div className="transactions-section">
                    <div className="transaction-count">
                      <span className="count-number">{block.Transactions}</span>
                      <span className="count-label">TXs</span>
                    </div>
                    <div className="virtual-ops-count">
                      <span className="count-number">{block.VirtualOps || 0}</span>
                      <span className="count-label">VOPs</span>
                    </div>
                  </div>

                  <div className="time-section">
                    <span className="time-ago">{block.TimeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IrreversibleBlocksTable;