import React, { useState, useEffect } from "react";
import axios from "axios";
import AccountLink from "../../components/Common/AccountLink";
import BlockLink from "../../components/Common/BlockLink";
import Loading from '../../components/Common/Loading';
import "./styles.css";

const WitnessList = () => {
  const [witnessData, setWitnessData] = useState([]);
  const [profileImages, setProfileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 50;

  // Profile image fetching function with timeout and error handling
  const fetchProfileImages = React.useCallback(async (witnesses) => {
    // Only fetch images for first 50 witnesses to reduce network load
    const imagePromises = witnesses.slice(0, 50).map(async (witness, index) => {
      try {
        // Add small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, index * 50));

        const metadata = witness.account_data?.json_metadata || witness.account_data?.posting_json_metadata;
        if (metadata) {
          const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          const profileImage = parsedMetadata?.profile?.profile_image;
          if (profileImage) {
            return { [witness.owner]: profileImage };
          }
        }
      } catch (error) {
      }
      return {};
    });

    // Use allSettled to prevent one failure from breaking all image loading
    const imageResults = await Promise.allSettled(imagePromises);
    const newImages = imageResults.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        return { ...acc, ...result.value };
      }
      return acc;
    }, {});

    setProfileImages(prev => ({ ...prev, ...newImages }));
  }, []);

  useEffect(() => {
    const fetchData = async (isInitial = false, retryCount = 0) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        // Clear any previous errors
        setError(null);
        // First, get basic witness ranking data
        const response = await axios.get(
          "https://steemyy.com/api/steemit/ranking/",
          {
            timeout: 30000, // 30 seconds timeout
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        );
        if (response.data && Array.isArray(response.data)) {
          // Limit to 400 witnesses for better performance
          const limitedData = response.data.slice(0, 400);
          setWitnessData(limitedData);
        } else {
          throw new Error('Invalid response format from witness API');
        }
      } catch (error) {
        // Retry mechanism for network timeouts and connection errors
        if ((error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ||
             error.message?.includes('timeout') || error.message?.includes('Network Error'))
             && retryCount < 2) {
          setError(`Network timeout. Retrying... (${retryCount + 2}/3)`);
          setTimeout(() => {
            fetchData(isInitial, retryCount + 1);
          }, Math.min(2000 * (retryCount + 1), 8000)); // Exponential backoff with max 8s delay
          return; // Don't set loading to false yet
        } else {
          const errorMessage = error.code === 'ECONNABORTED' ?
            'Request timeout - please check your internet connection' :
            error.response?.data?.message || error.message || 'Unknown error occurred';
          setError(`Failed to fetch witness data: ${errorMessage}`);
        }
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    };

    // Initial fetch
    fetchData(true);

    // Set up auto-refresh every 60 seconds (reduced frequency to avoid network strain)
    const interval = setInterval(() => {
      fetchData(false);
    }, 60000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Delayed profile image fetch when data loads (to avoid network congestion)
  useEffect(() => {
    if (witnessData.length > 0) {
      const timer = setTimeout(() => {
        fetchProfileImages(witnessData);
      }, 3000); // 3 second delay to let the main data load first

      return () => clearTimeout(timer);
    }
  }, [witnessData, fetchProfileImages]);

  // Helper functions
  const formatNumber = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }

    if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    } else {
      return value?.toString();
    }
  };

  const formatFeedAge = (lastUpdateTime) => {
    if (!lastUpdateTime) return { text: 'Never', isStale: true };

    try {
      const lastUpdate = new Date(lastUpdateTime + 'Z'); // Add Z for UTC
      const now = new Date();
      const secondsAgo = Math.floor((now - lastUpdate) / 1000);
      const isStale = secondsAgo >= 86400; // 24 hours or more

      let timeText;
      if (secondsAgo < 60) {
        timeText = `${secondsAgo}s`;
      } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        timeText = `${minutes}m`;
      } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        timeText = `${hours}h`;
      } else {
        const days = Math.floor(secondsAgo / 86400);
        timeText = `${days}d`;
      }

      return { text: timeText, isStale };
    } catch (error) {
      console.error('Error formatting feed age:', error);
      return { text: 'Error', isStale: true };
    }
  };

  const getWitnessStatus = (witness) => {
    const disabledSigningKey = "STM1111111111111111111111111111111114T1Anm";

    // Check if witness is disabled (special signing key)
    if (witness.signing_key === disabledSigningKey) {
      return { status: 'disabled', label: 'Disabled', color: '#ef4444' };
    }

    // Check if witness is currently active (from the data)
    if (witness.current) {
      return { status: 'active', label: 'Active', color: '#22c55e' };
    }

    // If they have a valid signing key but aren't active, they're standby
    if (witness.signing_key && witness.signing_key !== disabledSigningKey) {
      return { status: 'standby', label: 'Standby', color: '#f59e0b' };
    }

    // Default case
    return { status: 'inactive', label: 'Inactive', color: '#6b7280' };
  };

  const getRankBadgeColor = (rank) => {
    if (rank <= 20) return 'witness-rank-badge-top20';
    if (rank <= 50) return 'rank-badge-bronze';
    return 'rank-badge-default';
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return '👑';
    if (rank <= 10) return '🥇';
    if (rank <= 20) return '🥈';
    return '';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Loading
          message="Loading Witness Data..."
          size="medium"
          variant="primary"
        />
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = witnessData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(witnessData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="header-content">
        <h1 className="modern-title">STEEM Witnesses</h1>
        <p className="modern-subtitle">
          Active witnesses securing the Steem blockchain and producing blocks ({witnessData.length} total)
          {refreshing && <span className="refresh-indicator"> • Updating...</span>}
          {error && <span className="error-indicator"> • {error}</span>}
        </p>
      </div>

      <div className="headers-reference-card">
        <div className="table-scroll-container">
          <table className="headers-reference-table">
            <thead className="reference-header">
              <tr>
                <th>Rank</th>
                <th>Witness</th>
                <th>Status</th>
                <th>Votes</th>
                <th>Missed</th>
                <th>Latest Block</th>
                <th>Price Feed</th>
                <th>Feed Age</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((witness, index) => {
                const currentRank = index + 1 + indexOfFirstItem;
                const statusInfo = getWitnessStatus(witness);

                return (
                  <React.Fragment key={witness.id || index}>
                    <tr className="reference-row">
                      <td className="ref-rank">
                        <div className={`rank-badge ${getRankBadgeColor(currentRank)}`}>
                          {getRankIcon(currentRank)} #{currentRank}
                        </div>
                      </td>
                      <td className="ref-account">
                        <div className="ref-account-info">
                          <img
                            src={profileImages[witness.owner] || `https://steemitimages.com/u/${witness.owner}/avatar/small`}
                            alt={`${witness.owner} profile`}
                            className="ref-profile-avatar"
                            onError={(e) => {
                              e.target.src = `https://steemitimages.com/u/${witness.owner}/avatar/small`;
                            }}
                          />
                          <div className="ref-account-details">
                            <AccountLink
                              account={witness.owner}
                              className="ref-account-link"
                              showAt={true}
                            />
                            {witness.url && (
                              <a
                                href={witness.url.startsWith('http') ? witness.url : `https://${witness.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ref-website-link"
                                title="Visit website"
                              >
                                🔗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="ref-status">
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: `${statusInfo.color}20`,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}40`
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: statusInfo.color,
                            marginRight: '6px'
                          }}></div>
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="ref-votes">{formatNumber(witness.approval || 0)}</td>
                      <td className="ref-missed" style={{ color: witness.total_missed > 1000 ? '#ef4444' : 'inherit' }}>
                        {formatNumber(witness.total_missed || 0)}
                      </td>
                      <td className="ref-block">
                        <BlockLink
                          blockNumber={witness.last_confirmed_block_num}
                          showHash={false}
                        />
                      </td>
                      <td className="ref-price">
                        {witness.sbd_exchange_rate?.base || 'N/A'}
                      </td>
                      <td className="ref-feed-age">
                        {(() => {
                          const feedAge = formatFeedAge(witness.last_sbd_exchange_update);
                          return (
                            <span style={{
                              color: feedAge.isStale ? '#ef4444' : 'inherit',
                              fontWeight: feedAge.isStale ? '600' : 'normal'
                            }}>
                              {feedAge.text}
                              {feedAge.isStale && <span style={{fontSize: '0.7em', marginLeft: '4px'}}>⚠️</span>}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="ref-version">{witness.running_version || 'N/A'}</td>
                    </tr>
                    {currentRank === 21 && (
                      <tr className="witness-divider-row">
                        <td colSpan="9" className="witness-divider">
                          <div className="divider-content">
                            <span>⬆️ Active Witnesses (Top 21) ⬆️</span>
                            <span>⬇️ Backup Witnesses ⬇️</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="pagination-section">
            <div className="pagination-card">
              <div className="pagination-info">
                <span className="pagination-text">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <span className="pagination-details">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, witnessData.length)} of {witnessData.length} witnesses
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
    </div>
  );
};

export default WitnessList;