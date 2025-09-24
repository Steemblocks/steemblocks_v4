import React, { useState, useEffect } from 'react';
import NetworkActivity from './NetworkActivity';
import Supply from './Supply';
import './SteemPrice.css';

const SteemPrice = () => {
  const [blockchainData, setBlockchainData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch blockchain global properties with live updates
  const fetchBlockchainData = async () => {
    try {
      // Fetch global properties from Steem API
      const response = await fetch('https://api.steemit.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'condenser_api.get_dynamic_global_properties',
          params: [],
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blockchain data');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      setBlockchainData(result.result);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blockchain data:', err);
      setLoading(false);
    }
  };

  // Initial fetch and setup live updates
  useEffect(() => {
    fetchBlockchainData();

    // Set up live updates every 3 seconds for network activity
    const interval = setInterval(fetchBlockchainData, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch price data from CoinGecko
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=steem,puss,steem-dollars&vs_currencies=usd&include_market_cap=true&include_24hr_change=true'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data = await response.json();
        setPriceData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching price data:', err);
        setLoading(false);
      }
    };

    fetchPriceData();
  }, []);

  // Utility functions
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${price.toFixed(4)}`;
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0';
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  const formatPercentage = (change) => {
    if (!change) return '0.00%';
    const formatted = change.toFixed(2);
    return change >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  // Exchange data for each coin
  const exchangeData = {
    steem: [
      { name: 'Binance', url: 'https://www.binance.com/en/trade/STEEM_USDT' },
      { name: 'Upbit', url: 'https://upbit.com/exchange?code=CRIX.UPBIT.KRW-STEEM' },
      { name: 'Gate.io', url: 'https://www.gate.com/trade/STEEM_USDT' },
      { name: 'MEXC', url: 'https://www.mexc.com/exchange/STEEM_USDT' },
      { name: 'HTX', url: 'https://www.htx.com/trade/steem_usdt' },
      { name: 'Poloniex', url: 'https://www.poloniex.com/trade/STEEM_USDT/?type=spot' }
    ],
    sbd: [
      { name: 'HTX', url: 'https://www.htx.com/trade/sbd_usdt' },
      { name: 'Steemit Wallet', url: 'https://steemitwallet.com/market' }
    ],
    puss: [
      { name: 'BingX', url: 'https://bingx.com/en/spot/PUSSUSDT' },
      { name: 'BitMart', url: 'https://www.bitmart.com/en-US/trade/PUSS_USDT' },
      { name: 'Poloniex', url: 'https://www.poloniex.com/trade/PUSS_USDT?type=spot' },
      { name: 'Biconomy', url: 'https://www.biconomy.com/exchange/PUSS_USDT' },
      { name: 'SunSwap (DEX)', url: 'https://sunswap.com/#/v2?t1=TX5eXdf8458bZ77fk8xdvUgiQmC3L93iv7&type=swap&from=scan' }
    ]
  };

  // Handle buy button click
  const handleBuyClick = (coinType) => {
    setSelectedCoin(coinType);
    setShowExchangeModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowExchangeModal(false);
    setSelectedCoin(null);
  };

  if (loading) {
    return (
      <section className="blockchain-stats-section">
        <div className="stats-container">
          <div className="loading-skeleton">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blockchain-stats-section">
      <div className="stats-container">
        {/* Price Data Cards */}
        {priceData && (
          <div className="price-grid">
            {/* STEEM Price Card */}
            {priceData.steem && (
              <div className="price-card steem-card">
                <div className="coin-header">
                  <div className="coin-info">
                    <img
                      src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Steem-icon.png"
                      alt="STEEM"
                      className="coin-logo"
                      onError={(e) => {
                        e.target.src = '/favicon.ico';
                      }}
                    />
                    <div>
                      <h3 className="coin-name">STEEM</h3>
                      <p className="coin-symbol">STEEM</p>
                    </div>
                  </div>
                  <button
                    className="buy-button steem-buy"
                    onClick={() => handleBuyClick('steem')}
                  >
                    Buy
                  </button>
                </div>
                <div className="price-info">
                  <div className="current-price">
                    {formatPrice(priceData.steem.usd)}
                  </div>
                  <div className={`price-change ${priceData.steem.usd_24h_change >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(priceData.steem.usd_24h_change)}
                  </div>
                  <div className="market-cap">
                    <span className="label">Market Cap:</span>
                    <span className="value">{formatMarketCap(priceData.steem.usd_market_cap)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SBD Price Card */}
            {priceData['steem-dollars'] && (
              <div className="price-card sbd-card">
                <div className="coin-header">
                  <div className="coin-info">
                    <img
                      src="https://coin-images.coingecko.com/coins/images/398/large/steem.png"
                      alt="SBD"
                      className="coin-logo"
                      onError={(e) => {
                        e.target.src = '/favicon.ico';
                      }}
                    />
                    <div>
                      <h3 className="coin-name">Steem Dollars</h3>
                      <p className="coin-symbol">SBD</p>
                    </div>
                  </div>
                  <button
                    className="buy-button sbd-buy"
                    onClick={() => handleBuyClick('sbd')}
                  >
                    Buy
                  </button>
                </div>
                <div className="price-info">
                  <div className="current-price">
                    {formatPrice(priceData['steem-dollars'].usd)}
                  </div>
                  <div className={`price-change ${priceData['steem-dollars'].usd_24h_change >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(priceData['steem-dollars'].usd_24h_change)}
                  </div>
                  <div className="market-cap">
                    <span className="label">Market Cap:</span>
                    <span className="value">{formatMarketCap(priceData['steem-dollars'].usd_market_cap)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PUSS Price Card */}
            {priceData.puss && (
              <div className="price-card puss-card">
                <div className="coin-header">
                  <div className="coin-info">
                    <img
                      src="https://coin-images.coingecko.com/coins/images/50865/large/puss.jpg"
                      alt="PUSS"
                      className="coin-logo"
                      onError={(e) => {
                        e.target.src = '/favicon.ico';
                      }}
                    />
                    <div>
                      <h3 className="coin-name">PUSS</h3>
                      <p className="coin-symbol">PUSS</p>
                    </div>
                  </div>
                  <button
                    className="buy-button puss-buy"
                    onClick={() => handleBuyClick('puss')}
                  >
                    Buy
                  </button>
                </div>
                <div className="price-info">
                  <div className="current-price">
                    {formatPrice(priceData.puss.usd)}
                  </div>
                  <div className={`price-change ${priceData.puss.usd_24h_change >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(priceData.puss.usd_24h_change)}
                  </div>
                  <div className="market-cap">
                    <span className="label">Market Cap:</span>
                    <span className="value">{formatMarketCap(priceData.puss.usd_market_cap)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Data Grid */}
        {blockchainData && (
          <div className="blockchain-grid">
            <NetworkActivity blockchainData={blockchainData} lastUpdate={lastUpdate} />
            <Supply blockchainData={blockchainData} />
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error loading blockchain data: {error}</p>
          </div>
        )}

        {/* Exchange Modal */}
        {showExchangeModal && selectedCoin && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Buy {selectedCoin.toUpperCase()}</h3>
                <button className="close-button" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <p className="modal-description">
                  Choose an exchange to buy {selectedCoin.toUpperCase()}:
                </p>
                <div className="exchange-grid">
                  {exchangeData[selectedCoin]?.map((exchange, index) => (
                    <a
                      key={index}
                      href={exchange.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="exchange-card"
                    >
                      <span className="exchange-name">{exchange.name}</span>
                      <svg className="external-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SteemPrice;