import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './NetworkActivity.css';

const NetworkActivity = ({ blockchainData, lastUpdate }) => {
  const navigate = useNavigate();
  const [blockHeader, setBlockHeader] = useState(null);
  const [currentWitness, setCurrentWitness] = useState(null);
  const [medianPrice, setMedianPrice] = useState(null);
  const [hardforkVersion, setHardforkVersion] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Handle block click navigation
  const handleBlockClick = (blockNumber) => {
    navigate(`/blocks/${blockNumber}`);
  };

  // Handle account click navigation
  const handleAccountClick = (accountName) => {
    navigate(`/accounts/${accountName}`);
  };

  // Handle copy functionality
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  // Fetch median price data from steemworld API
  const fetchMedianPrice = useCallback(async () => {
    try {
      const response = await fetch('https://sds0.steemworld.org/steem_requests_api/condenser_api.get_current_median_history_price');

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.result) {
          // Extract base (SBD) and quote (STEEM) values
          const baseValue = parseFloat(data.result.base.split(' ')[0]);
          const quoteValue = parseFloat(data.result.quote.split(' ')[0]);

          // Calculate median price (base / quote) with 4 decimal places
          const medianPriceValue = (baseValue / quoteValue).toFixed(4);
          setMedianPrice(medianPriceValue);
        }
      }
    } catch (error) {
      console.error('Error fetching median price:', error);
      setMedianPrice('Error');
    }
  }, []);

  // Fetch witness data from steemyy.com API (limit to top 1 witness for maximum performance)
  const fetchWitnessData = useCallback(async () => {
    try {
      const response = await fetch('https://steemyy.com/api/steemit/ranking/');

      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result)) {
          // Limit to just 1 witness for maximum performance - we only need running version
          const topWitness = result.slice(0, 1);

          // Get hardfork version from the first witness
          if (topWitness.length > 0 && topWitness[0].running_version) {
            setHardforkVersion(topWitness[0].running_version);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching witness data:', error);
    }
  }, []);

  // Fetch block header data
  const fetchBlockHeader = useCallback(async () => {
    try {
      if (!blockchainData?.head_block_number) return;

      const response = await fetch('https://api.steemit.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_block_header',
          params: [blockchainData.head_block_number],
          id: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.result) {
          setBlockHeader(result.result);
          setCurrentWitness(result.result.witness);
        }
      }
    } catch (error) {
      console.error('Error fetching block header:', error);
    }
  }, [blockchainData?.head_block_number]);

  // Fetch initial data when blockchain data updates
  useEffect(() => {
    if (blockchainData?.head_block_number) {
      fetchBlockHeader();
      fetchWitnessData();
      fetchMedianPrice();
    }
  }, [blockchainData?.head_block_number, fetchBlockHeader, fetchWitnessData, fetchMedianPrice]);

  // Auto-refresh data every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (blockchainData?.head_block_number) {
        fetchBlockHeader();
        fetchWitnessData();
        fetchMedianPrice();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [blockchainData?.head_block_number, fetchBlockHeader, fetchWitnessData, fetchMedianPrice]);
  return (
    <div className="network-activity-card">
      {/* Card Header */}
      <div className="network-card-header">
        <div className="network-header-left">
          <div className="network-icon">⚡</div>
          <div className="network-header-info">
            <h3>Network Activity & Status</h3>
            <p>Live blockchain metrics and system information</p>
          </div>
        </div>
        <div className="network-header-right">
          <div className="network-live-indicator">
            <div className="network-live-dot"></div>
            <span className="network-live-text">Live</span>
          </div>
          <div className="network-update-time">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="network-card-content">
        {/* Network Activity Section */}
        <div className="network-section">
          <h4 className="network-section-title">
            ⚡ Network Activity
          </h4>
          <div className="network-data-list">
            <div className="network-data-item primary">
              <div className="network-data-label">Head Block</div>
              <div className="network-data-value">
                <span
                  className="network-clickable network-live-value"
                  onClick={() => handleBlockClick(blockchainData.head_block_number)}
                  title="Click to view block details"
                >
                  {blockchainData.head_block_number?.toString() || 'Loading...'}
                </span>
              </div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Last Irreversible</div>
              <div className="network-data-value">
                <span
                  className="network-clickable"
                  onClick={() => handleBlockClick(blockchainData.last_irreversible_block_num)}
                  title="Click to view block details"
                >
                  {blockchainData.last_irreversible_block_num?.toString() || 'Loading...'}
                </span>
              </div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Current Witness</div>
              <div className="network-data-value">
                {currentWitness ? (
                  <span
                    className="network-clickable network-witness-value"
                    onClick={() => handleAccountClick(currentWitness)}
                    title="Click to view witness account details"
                  >
                    {currentWitness}
                  </span>
                ) : (
                  <span className="network-witness-value">Loading...</span>
                )}
              </div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Median Price</div>
              <div className="network-data-value">
                {medianPrice ? `$${medianPrice}` : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Network Status Section */}
        <div className="network-section">
          <h4 className="network-section-title">
            🔧 Network Status
          </h4>
          <div className="network-data-list">
            <div className="network-data-item">
              <div className="network-data-label">Block Time</div>
              <div className="network-data-value">3s</div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Running Version</div>
              <div className="network-data-value">
                <span className="network-version-badge">
                  {hardforkVersion ?
                    `v${hardforkVersion}` :
                    blockchainData.hardfork_version ?
                      `HF ${blockchainData.hardfork_version}` :
                      'Loading...'
                  }
                </span>
              </div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Block ID</div>
              <div className="network-data-value">
                <div className="network-block-id-container">
                  <div
                    className="network-full-block-id network-clickable"
                    onClick={() => handleBlockClick(blockchainData.head_block_number)}
                    title="Click to view block details"
                  >
                    {(blockHeader?.block_id || blockchainData.head_block_id) || 'Loading...'}
                  </div>
                  {(blockHeader?.block_id || blockchainData.head_block_id) && (
                    <button
                      className={`network-copy-button ${copyStatus === 'copied' ? 'copied' : ''}`}
                      onClick={() => handleCopy(blockHeader?.block_id || blockchainData.head_block_id)}
                      title="Copy Block ID"
                    >
                      {copyStatus === 'copied' ? '✓ Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="network-data-item">
              <div className="network-data-label">Network Time</div>
              <div className="network-data-value">
                <span className="network-time-value">
                  {blockchainData.time ?
                    new Date(blockchainData.time + 'Z').toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    }) + ' UTC' :
                    'Loading...'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkActivity;