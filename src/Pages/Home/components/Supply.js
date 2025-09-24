import React from 'react';
import './Supply.css';

const Supply = ({ blockchainData }) => {
  const formatBalance = (balance) => {
    if (!balance) return '0';
    const amount = parseFloat(balance.split(' ')[0]);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  };

  // Calculate inflation rate based on STEEM blockchain parameters
  const calculateInflation = () => {
    if (!blockchainData.current_supply || !blockchainData.virtual_supply) return '0.00';

    // STEEM inflation model based on official blockchain configuration
    // STEEM_INFLATION_RATE_START_PERCENT: 978 (9.78% in basis points)
    // STEEM_INFLATION_RATE_STOP_PERCENT: 95 (0.95% in basis points)
    // STEEM_INFLATION_NARROWING_PERIOD: 250000 blocks
    const blockNumber = blockchainData.head_block_number || 0;

    const startingRateBasisPoints = 978; // 9.78% in basis points
    const stopRateBasisPoints = 95; // 0.95% in basis points
    const narrowingPeriod = 250000; // Blocks per reduction period

    // Calculate how many narrowing periods have passed
    const periods = Math.floor(blockNumber / narrowingPeriod);

    // Calculate current rate in basis points (reduces by 1 basis point per period)
    const currentRateBasisPoints = Math.max(
      startingRateBasisPoints - periods,
      stopRateBasisPoints
    );

    // Convert basis points to percentage (divide by 100)
    const currentInflationRate = currentRateBasisPoints / 100;

    return currentInflationRate.toFixed(2);
  };

  // Calculate STEEM supply per day based on inflation rate
  const calculateDailySupply = () => {
    if (!blockchainData.current_supply || !blockchainData.virtual_supply) return '0.000';

    // Get current virtual supply (includes all STEEM + powered up STEEM)
    const virtualSupply = parseFloat(blockchainData.virtual_supply.split(' ')[0]);
    const currentInflationRate = parseFloat(calculateInflation());

    // Calculate daily supply: (Virtual Supply × Inflation Rate) ÷ 365
    const dailySupply = (virtualSupply * currentInflationRate / 100) / 365;

    return dailySupply.toFixed(0); // Return as whole number
  };

  return (
    <div className="stats-card combined-supply-economic-card">
      <div className="card-header">
        <div className="header-left">
          <div className="card-icon supply-economic-icon">💰</div>
          <div className="header-info">
            <h3 className="card-title">Supply & Economic Data</h3>
            <p className="card-subtitle">Token circulation and network economics</p>
          </div>
        </div>
      </div>
      <div className="combined-content">
        {/* Supply Statistics Section */}
        <div className="content-section supply-section">
          <div className="section-header">
            <h4 className="section-title">📊 Supply Statistics</h4>
          </div>
          <div className="supply-stats">
            <div className="supply-item steem-supply">
              <div className="supply-header">
                <span className="token-name">STEEM</span>
                <span className="supply-type">Current Supply</span>
              </div>
              <div className="supply-value">
                {formatBalance(blockchainData.current_supply)}
              </div>
            </div>
            <div className="supply-item virtual-supply">
              <div className="supply-header">
                <span className="token-name">STEEM</span>
                <span className="supply-type">Virtual Supply</span>
              </div>
              <div className="supply-value">
                {formatBalance(blockchainData.virtual_supply)}
              </div>
            </div>
            <div className="supply-item sbd-supply">
              <div className="supply-header">
                <span className="token-name">SBD</span>
                <span className="supply-type">Current Supply</span>
              </div>
              <div className="supply-value">
                {formatBalance(blockchainData.current_sbd_supply)}
              </div>
            </div>
            <div className="supply-item inflation-rate">
              <div className="supply-header">
                <span className="token-name">STEEM INFLATION</span>
                <span className="supply-type">Inflation Rate</span>
              </div>
              <div className="supply-value">
                {calculateInflation()}% Annual
              </div>
            </div>
          </div>
        </div>

        {/* Economic Indicators Section */}
        <div className="content-section economic-section">
          <div className="section-header">
            <h4 className="section-title">📈 Economic Indicators</h4>
          </div>
          <div className="economic-grid">
            <div className="economic-stat">
              <div className="eco-label">SBD Print Rate</div>
              <div className="eco-value">
                {blockchainData.sbd_print_rate ?
                  `${(blockchainData.sbd_print_rate / 100).toFixed(2)}%` :
                  '0.00%'
                }
              </div>
              <div className="eco-description">Debt ratio control</div>
            </div>
            <div className="economic-stat">
              <div className="eco-label">SBD Interest Rate</div>
              <div className="eco-value">
                {blockchainData.sbd_interest_rate ?
                  `${(blockchainData.sbd_interest_rate / 100).toFixed(2)}%` :
                  '0.00%'
                }
              </div>
              <div className="eco-description">Savings APR</div>
            </div>
            <div className="economic-stat">
              <div className="eco-label">STEEM Supply per Day</div>
              <div className="eco-value">
                {calculateDailySupply()} STEEM
              </div>
              <div className="eco-description">Daily inflation output</div>
            </div>
            <div className="economic-stat">
              <div className="eco-label">Total Vesting</div>
              <div className="eco-value">
                {formatBalance(blockchainData.total_vesting_fund_steem)} STEEM
              </div>
              <div className="eco-description">Powered up tokens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supply;