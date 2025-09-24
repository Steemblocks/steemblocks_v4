import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountLink from '../../components/Common/AccountLink';
import Loading from '../../components/Common/Loading';
import IrreversibleBlocksTable from '../../components/Common/IrreversibleBlocksTable';
import './styles.css';
import '../Home/styles.css';

const Blocks = () => {
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Latest Blocks (Head Block - 5 blocks)
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState(null);

  const [witnessImages, setWitnessImages] = useState({});
  const [isLive, setIsLive] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [newLatestBlockIds] = useState(new Set());

  // Use refs to prevent infinite loops and manage intervals
  const isInitializedRef = useRef(false);
  const intervalRef = useRef(null);
  const blockIntervalRef = useRef(null);

  // Search functionality
  const detectSearchType = (input) => {
    const trimmedInput = input.trim();

    // Check if it's a block number (only digits)
    if (/^\d+$/.test(trimmedInput)) {
      return { type: 'block', value: trimmedInput };
    }

    // Check if it's a transaction ID (hexadecimal string, typically 40 characters)
    if (/^[a-fA-F0-9]{40}$/.test(trimmedInput)) {
      return { type: 'transaction', value: trimmedInput };
    }

    // Check if it's an account name (alphanumeric with dots, dashes, typically 3-16 chars)
    if (/^[a-zA-Z0-9.-]{3,16}$/.test(trimmedInput)) {
      return { type: 'account', value: trimmedInput };
    }

    // Default to account if unclear
    return { type: 'account', value: trimmedInput };
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      return;
    }

    const searchResult = detectSearchType(searchTerm);

    switch (searchResult.type) {
      case 'block':
        navigate(`/blocks/${searchResult.value}`);
        break;
      case 'transaction':
        navigate(`/transactions/${searchResult.value}`);
        break;
      case 'account':
        navigate(`/accounts/${searchResult.value}`);
        break;
      default:
        navigate(`/accounts/${searchResult.value}`);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

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

  // Helper function to fetch simple block data (for latest blocks section)
  const fetchSimpleBlock = useCallback(async (blockNum) => {
    try {
      const blockResponse = await axios.post("https://api.steemit.com", {
        jsonrpc: "2.0",
        method: "condenser_api.get_block",
        params: [blockNum],
        id: 1
      }, { timeout: 5000 });

      if (blockResponse.data && blockResponse.data.result) {
        const blockData = blockResponse.data.result;
        const transactionCount = blockData.transactions ? blockData.transactions.length : 0;
        const blockWitness = blockData.witness || 'N/A';
        const blockTimestamp = blockData.timestamp;

        return {
          BlockNumber: blockNum,
          Number: blockNum,
          Witness: blockWitness,
          Transactions: transactionCount,
          Timestamp: blockTimestamp,
          TimeAgo: formatTimeAgo(blockTimestamp)
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching simple block ${blockNum}:`, error);
      return null;
    }
  }, []);

  // Fetch latest blocks (simple data, 5 blocks)
  const fetchLatestBlocks = useCallback(async (headBlockNumber, isUpdate = false) => {
    try {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const blockNum = headBlockNumber - i;
        if (blockNum > 0) {
          promises.push(fetchSimpleBlock(blockNum));
        }
      }

      const results = await Promise.all(promises);
      const validBlocks = results.filter(block => block !== null);
      const sortedBlocks = validBlocks.sort((a, b) => b.Number - a.Number);

      if (sortedBlocks.length > 0) {
        // Add blocks one by one with animation timing
        if (isUpdate) {
          // For live updates, just add new blocks normally
          setLatestBlocks(sortedBlocks);
        } else {
          // For initial load, add blocks sequentially with animation
          setLatestBlocks([]);

          // Add blocks one by one with proper timing
          const addBlockSequentially = (blockIndex) => {
            if (blockIndex >= sortedBlocks.length) return;

            const block = sortedBlocks[blockIndex];
            setLatestBlocks(prevBlocks => [...prevBlocks, { ...block, isNewBlock: true }]);

            // Remove animation flag after animation completes
            setTimeout(() => {
              setLatestBlocks(currentBlocks =>
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
      }

    } catch (error) {
      console.error('Error fetching latest blocks:', error);
      setLatestError('Failed to fetch latest blocks');
    } finally {
      if (!isUpdate) {
        setLatestLoading(false);
      }
    }
  }, [fetchSimpleBlock, fetchWitnessImages]);

  // Track current block numbers
  const currentHeadBlockRef = useRef(0);

  // Start live updates
  const startLiveUpdates = useCallback(() => {
    if (intervalRef.current || blockIntervalRef.current) {
      return;
    }
    setIsLive(true);

    // Update blocks every 3 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await axios.post("https://api.steemit.com", {
          jsonrpc: "2.0",
          method: "condenser_api.get_dynamic_global_properties",
          params: [],
          id: 1
        }, { timeout: 5000 });

        if (response.data && response.data.result) {
          const headBlock = response.data.result.head_block_number;

          // Update latest blocks if head block changed
          if (headBlock > currentHeadBlockRef.current) {
            await fetchLatestBlocks(headBlock, true);
            currentHeadBlockRef.current = headBlock;
          }

          setLastUpdateTime(new Date());
        }
      } catch (error) {
        console.error('Error in live update interval:', error);
      }
    }, 3000);

    // Update timestamps every 30 seconds
    blockIntervalRef.current = setInterval(() => {
      setLatestBlocks(prevBlocks =>
        prevBlocks.map(block => ({
          ...block,
          TimeAgo: formatTimeAgo(block.Timestamp)
        }))
      );
    }, 30000);

  }, [fetchLatestBlocks]);

  // Stop live updates
  const stopLiveUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (blockIntervalRef.current) {
      clearInterval(blockIntervalRef.current);
      blockIntervalRef.current = null;
    }
    setIsLive(false);
  }, []);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      try {
        const response = await axios.post("https://api.steemit.com", {
          jsonrpc: "2.0",
          method: "condenser_api.get_dynamic_global_properties",
          params: [],
          id: 1
        }, { timeout: 5000 });

        if (response.data && response.data.result) {
          const headBlock = response.data.result.head_block_number;
          // Fetch latest blocks
          await fetchLatestBlocks(headBlock);

          currentHeadBlockRef.current = headBlock;
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setLatestError('Failed to initialize latest blocks');
      }
    };

    initializeData();
  }, [fetchLatestBlocks]);

  // Start live updates after initial load
  useEffect(() => {
    if (!latestLoading && latestBlocks.length > 0 && !intervalRef.current) {
      // Start live updates after latest blocks are loaded
      const timer = setTimeout(() => {
        startLiveUpdates();
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [latestLoading, latestBlocks.length, startLiveUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveUpdates();
    };
  }, [stopLiveUpdates]);

  // Time update interval (handled in startLiveUpdates now)

  return (
    <div className="blocks-page">
      <div className="blocks-container">
        <div className="blocks-header">
          <h1>Blockchain Explorer</h1>
          <p>Real-time blockchain block explorer showing the latest head blocks and confirmed irreversible blocks</p>
        </div>

        {/* Search Section */}
        <section className="home-search-section">
          <div className="home-search-container">
            <form onSubmit={handleSearch} className="home-search-wrapper">
              <input
                type="text"
                placeholder="Search blocks, transactions, or accounts..."
                className="home-search-input"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <button type="submit" className="home-search-button">
                <svg className="home-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </section>

        <div className="blocks-sections">

          {/* Latest Blocks Section (Head Block - 5 blocks) */}
          <div className="blocks-section">
            <div className="section-header">
              <div className="section-header-info">
                <h2>Latest Blocks</h2>
                <p>Most recent 5 blocks following the head block (may include unconfirmed blocks)</p>
              </div>
              {isLive && (
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  <span>LIVE</span>
                  {lastUpdateTime && (
                    <span className="last-update">
                      Updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>

        <div className='latest-blocks-container'>
          {latestError && (
            <div className="latest-blocks-error-message">
              <span className="error-icon">⚠️</span>
              {latestError}
            </div>
          )}

          {latestLoading || latestBlocks.length === 0 ? (
            <div className="latest-blocks-loading-container">
              <Loading />
              <p>Loading latest blocks...</p>
            </div>
          ) : (
            <div className="latest-blocks-list">
              {latestBlocks.map((block, index) => {
                const isNewBlock = block.isNewBlock || newLatestBlockIds.has(block.BlockNumber);

                return (
                  <div
                    key={`latest-${block.BlockNumber}-${index}`}
                    className={`block-item simple-block ${isNewBlock ? 'new-block-entering' : ''}`.trim()}
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
          )}
        </div>
      </div>

          {/* Irreversible Blocks Section (10 blocks with complete data) */}
          <div className="blocks-section">
            <IrreversibleBlocksTable
              showHeader={true}
              blockCount={10}
              className=""
              isLive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blocks;