import React, { useState, useEffect } from "react";
import axios from "axios";
import AccountLink from "../../components/Common/AccountLink";
import BlockLink from "../../components/Common/BlockLink";
import Loading from "../../components/Common/Loading";
import "./styles.css";

const NewAccount = () => {
  const [newAccountData, setNewAccountData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Get the actual date range from available data
  const getDateRange = () => {
    if (newAccountData.length === 0) return { start: new Date(), end: new Date(), days: 0 };

    const dates = newAccountData.map(account => new Date(account.time));
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    return { start: startDate, end: endDate, days: daysDiff };
  };

  const getAnalytics = () => {
    const totalAccounts = newAccountData.length;
    const dateRange = getDateRange();
    const averagePerDay = dateRange.days > 0 ? Math.round(totalAccounts / dateRange.days) : 0;

    return {
      totalAccounts,
      averagePerDay,
      dateRange
    };
  };

  // Prepare chart data using actual available date range
  const getChartData = () => {
    if (newAccountData.length === 0) return [];

    const chartData = [];
    const dateRange = getDateRange();

    // Create a map of dates to account counts for efficient lookup
    const accountsByDate = {};
    newAccountData.forEach(account => {
      const dateKey = new Date(account.time).toISOString().split('T')[0];
      accountsByDate[dateKey] = (accountsByDate[dateKey] || 0) + 1;
    });

    // Generate chart data for each day in the actual date range
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const accountsOnDay = accountsByDate[dateKey] || 0;

      chartData.push({
        date: dateKey,
        day: currentDate.getDate(),
        month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
        accounts: accountsOnDay
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  };

  const analytics = getAnalytics();
  const chartData = getChartData();

  // Handle chart point hover
  const handleChartPointHover = (event, point) => {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'block';
      tooltip.style.left = event.clientX + 10 + 'px';
      tooltip.style.top = event.clientY - 30 + 'px';
      tooltip.innerHTML = `
        <div><strong>${point.accounts} accounts</strong></div>
        <div>${new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}</div>
      `;
    }
  };

  const handleChartPointLeave = () => {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://steemdata.justyy.workers.dev/?data=newaccounts"
        );
        if (Array.isArray(response.data)) {
          setNewAccountData(response.data);
        }
      } catch (error) {
        console.error("Error fetching new account data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newAccountData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(newAccountData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="container">
          <Loading
            message="Loading New Account Data..."
            size="medium"
            variant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Chart Tooltip */}
      <div id="chart-tooltip" className="chart-tooltip"></div>

      {/* Header Section */}
      <div className="header-content">
        <h1 className="modern-title">New Account Registrations</h1>
        <p className="modern-subtitle">
          Track and analyze newly registered STEEM accounts with comprehensive analytics
        </p>
      </div>

        {/* Account Creation Analytics Section */}
        <section className="analytics-section">
          <div className="analytics-header">
            <div className="analytics-title-section">
              <div className="analytics-icon">
                <div className="icon-square"></div>
              </div>
              <div className="analytics-text">
                <h2 className="analytics-title">Account Creation Analytics</h2>
                <p className="analytics-subtitle">Daily registration trends and statistical insights from available data</p>
              </div>
            </div>
            <div className="time-filter-badge">
              <span className="filter-dot"></span>
              {analytics.dateRange.days > 0 ? (
                `${analytics.dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${analytics.dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              ) : (
                'No Data'
              )}
            </div>
          </div>

          <div className="analytics-cards">
            <div className="analytics-card" style={{
              animation: 'slideInUp 0.6s ease-out 0.1s both'
            }}>
              <div className="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="card-content">
                <h3 className="card-value" style={{
                  animation: 'countUp 1s ease-out 0.8s both'
                }}>{analytics.totalAccounts.toLocaleString()}</h3>
                <p className="card-label">Total New Accounts</p>
                <p className="card-period">{analytics.dateRange.days} Days of Data</p>
              </div>
            </div>

            <div className="analytics-card" style={{
              animation: 'slideInUp 0.6s ease-out 0.2s both'
            }}>
              <div className="card-icon calendar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="card-content">
                <h3 className="card-value" style={{
                  animation: 'countUp 1s ease-out 0.9s both'
                }}>{analytics.averagePerDay}</h3>
                <p className="card-label">Average Per Day</p>
                <p className="card-period">Daily Rate</p>
              </div>
            </div>
          </div>

          {/* 30-Day Chart */}
          <div className="chart-section" style={{
            animation: 'slideInUp 0.8s ease-out 0.3s both'
          }}>
            <div className="chart-header">
              <h3 className="chart-title">Daily Registration Trend</h3>
              <p className="chart-subtitle">Account registrations over {analytics.dateRange.days} days of available data</p>
            </div>

            {isLoading ? (
              <div className="chart-loading">
                <div className="chart-loading-bars">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="loading-bar"
                      style={{
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
                <p>Loading chart data...</p>
              </div>
            ) : (
              <div className="chart-container">
              <div className="chart-y-axis">
                {/* Y-axis labels */}
                {[...Array(6)].map((_, i) => {
                  const maxValue = Math.max(...chartData.map(d => d.accounts));
                  const value = Math.round((maxValue / 5) * (5 - i));
                  return (
                    <div key={i} className="y-axis-label">
                      {value}
                    </div>
                  );
                })}
              </div>

              <div className="chart-content">
                <svg className="chart-svg" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
                  {/* Animated Grid lines */}
                  {[...Array(6)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 40}
                      x2="800"
                      y2={i * 40}
                      stroke="#374151"
                      strokeWidth="1"
                      opacity="0"
                      className="grid-line"
                      style={{
                        animation: `fadeInGrid 0.8s ease-out ${i * 0.1}s forwards`
                      }}
                    />
                  ))}

                  {/* Animated Chart line */}
                  <polyline
                    fill="none"
                    stroke="#00d4aa"
                    strokeWidth="3"
                    strokeDasharray="2000"
                    strokeDashoffset="2000"
                    className="chart-line"
                    points={chartData.map((point, index) => {
                      const maxValue = Math.max(...chartData.map(d => d.accounts)) || 1;
                      const x = (index / (chartData.length - 1)) * 800;
                      const y = 200 - (point.accounts / maxValue) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                    style={{
                      animation: 'drawLine 2s ease-out 0.5s forwards'
                    }}
                  />

                  {/* Animated gradient area under the line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#chartGradient)"
                    strokeWidth="0"
                    className="chart-area"
                    opacity="0"
                    points={`0,200 ${chartData.map((point, index) => {
                      const maxValue = Math.max(...chartData.map(d => d.accounts)) || 1;
                      const x = (index / (chartData.length - 1)) * 800;
                      const y = 200 - (point.accounts / maxValue) * 180;
                      return `${x},${y}`;
                    }).join(' ')} 800,200`}
                    style={{
                      animation: 'fadeInArea 1s ease-out 1.5s forwards'
                    }}
                  />

                  {/* Animated Data points */}
                  {chartData.map((point, index) => {
                    const maxValue = Math.max(...chartData.map(d => d.accounts)) || 1;
                    const x = (index / (chartData.length - 1)) * 800;
                    const y = 200 - (point.accounts / maxValue) * 180;
                    return (
                      <g key={index}>
                        {/* Pulse ring effect */}
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke="#00d4aa"
                          strokeWidth="2"
                          opacity="0"
                          className="chart-point-ring"
                          style={{
                            animation: `pulseRing 2s ease-out ${2 + index * 0.1}s infinite`
                          }}
                        />
                        {/* Main data point */}
                        <circle
                          cx={x}
                          cy={y}
                          r="0"
                          fill="#00d4aa"
                          className="chart-point"
                          onMouseEnter={(e) => handleChartPointHover(e, point)}
                          onMouseLeave={handleChartPointLeave}
                          style={{
                            animation: `popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${2 + index * 0.05}s forwards`
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="chart-x-axis">
                  {chartData.filter((_, i) => i % 5 === 0).map((point, index) => (
                    <div key={index} className="x-axis-label">
                      {point.month} {point.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* All New Accounts Section */}
        <section className="accounts-section">
          <div className="accounts-header">
            <div className="accounts-title-section">
              <div className="accounts-icon">
                <div className="icon-square"></div>
              </div>
              <div className="accounts-text">
                <h2 className="accounts-title">All New Accounts</h2>
                <p className="accounts-subtitle">Complete list of newly registered accounts with detailed information and creation data</p>
              </div>
            </div>
          </div>

          <div className="accounts-table dark">
            <div className="table-header">
              <div className="header-cell">Account Name</div>
              <div className="header-cell">Account Creator</div>
              <div className="header-cell">Block Number</div>
              <div className="header-cell">Creation Date</div>
            </div>

            <div className="table-body">
              {currentItems.map((accountData, index) => {
                // Use correct field names from API response
                const accountName = accountData.account || 'unknown';
                const creator = accountData.creator || 'steemit';
                const blockNumber = accountData.block || 'N/A';
                const creationDate = accountData.time;

                return (
                  <div key={index} className="table-row">
                    <div className="cell account-cell" data-label="Account Name">
                      <div className="account-info">
                        <div className="account-avatar">
                          <img
                            src={`https://steemitimages.com/u/${accountName}/avatar/small`}
                            alt={accountName}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="avatar-fallback" style={{ display: 'none' }}>
                            {accountName ? accountName.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                        <AccountLink account={accountName} className="account-name" />
                      </div>
                    </div>

                    <div className="cell creator-cell" data-label="Creator">
                      <AccountLink account={creator} className="creator-name" />
                    </div>

                    <div className="cell block-cell" data-label="Block Number">
                      <BlockLink
                        blockNumber={blockNumber}
                        className="block-number-link"
                        showHash={true}
                      />
                    </div>

                    <div className="cell date-cell" data-label="Creation Date">
                      <span className="creation-date">
                        {creationDate ? formatDate(creationDate) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="pagination-section">
            <div className="pagination-card">
              <div className="pagination-info">
                <span className="pagination-text">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
              </div>

              <div className="pagination-controls">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  Previous
                </button>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>
        )}
    </div>
  );
};

export default NewAccount;
