import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Common/Loading';
import './AccountResult.css';
import '../Home/styles.css'; // Import Home page styles for search bar

const AccountResult = () => {
  const { accountName } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const [accountHistory, setAccountHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch comprehensive account data using SteemWorld API and account history
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch comprehensive account data from SteemWorld API
        const accountResponse = await fetch(`https://sds0.steemworld.org/accounts_api/getAccountExt/${accountName}`);
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account data');
        }
        const accountData = await accountResponse.json();

        if (accountData.code !== 0 || !accountData.result) {
          throw new Error('Account not found');
        }

        setAccountData(accountData.result);

        // Fetch recent account history from official Steem API
        try {
          const historyResponse = await fetch('https://api.steemit.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'condenser_api.get_account_history',
              params: [accountName, -1, 20],
              id: 1,
            }),
          });

          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            if (historyResult.result && !historyResult.error && Array.isArray(historyResult.result)) {
              setAccountHistory(historyResult.result);
            } else {
              setAccountHistory([]);
            }
          } else {

            setAccountHistory([]);
          }
        } catch (historyError) {

          setAccountHistory([]);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accountName) {
      fetchAccountData();
    }
  }, [accountName]);

  // Utility functions
  const parseProfile = (metadata) => {
    try {
      if (typeof metadata === 'string') {
        return JSON.parse(metadata);
      }
      return metadata || {};
    } catch (error) {
      return {};
    }
  };

  const formatBalance = (balance, symbol = 'STEEM') => {
    if (typeof balance === 'number') {
      return `${balance.toFixed(3)} ${symbol}`;
    }
    return `0.000 ${symbol}`;
  };

  const formatSteemPower = (vests) => {
    if (typeof vests === 'number') {
      // Approximate conversion: 1 SP ≈ 2000 VESTS
      const sp = vests / 2000000;
      return `${sp.toFixed(0)} SP`;
    }
    return '0 SP';
  };

  const formatPercentage = (value) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}%`;
    }
    return '0.00%';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = new Date();
    const actionDate = new Date(timestamp * 1000);
    const diffInMs = now - actionDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Active now' : `Active ${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? 'Active 1 hour ago' : `Active ${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return diffInDays === 1 ? 'Active 1 day ago' : `Active ${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? 'Active 1 month ago' : `Active ${diffInMonths} months ago`;
    } else {
      return diffInYears === 1 ? 'Active 1 year ago' : `Active ${diffInYears} years ago`;
    }
  };

  // Search functionality (matching Home page implementation)
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

    if (!searchQuery.trim()) {
      return;
    }

    const searchResult = detectSearchType(searchQuery);

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
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Loading
          message="Loading account data..."
          size="medium"
          variant="primary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        {/* Search Bar */}
        <div className="account-search-container">
          <form onSubmit={handleSearch} className="account-search-form">
            <div className="account-search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts, transactions, or blocks..."
                className="account-search-input"
              />
              <button type="submit" className="account-search-button">
                🔍
              </button>
            </div>
          </form>
        </div>

        <div className="account-error">
          <h2>Error Loading Account</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
            style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'var(--primary-gradient)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="dashboard-container">
        {/* Search Bar */}
        <div className="account-search-container">
          <form onSubmit={handleSearch} className="account-search-form">
            <div className="account-search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts, transactions, or blocks..."
                className="account-search-input"
              />
              <button type="submit" className="account-search-button">
                🔍
              </button>
            </div>
          </form>
        </div>

        <div className="account-error">
          <h2>Account Not Found</h2>
          <p>The account "{accountName}" could not be found on the Steem blockchain.</p>
          <p style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Please check the spelling and try again.
          </p>
        </div>
      </div>
    );
  }

  // Parse profile data from JSON metadata
  const jsonMetadata = parseProfile(accountData.json_metadata);
  const postingJsonMetadata = parseProfile(accountData.posting_json_metadata);

  const profileData = {
    ...jsonMetadata?.profile,
    ...postingJsonMetadata?.profile
  };

  // Debug log to check profile data

  // Comprehensive account information sections
  const basicStats = [
    { label: 'Account ID', value: accountData.id || 'N/A' },
    { label: 'Username', value: accountData.name || 'N/A' },
    { label: 'Creator', value: accountData.creator || 'N/A' },
    { label: 'Recovery Account', value: accountData.recovery_account || 'N/A' },
    { label: 'Proxy', value: accountData.proxy || 'None' },
    { label: 'Reputation', value: accountData.reputation ? accountData.reputation.toFixed(2) : '25.00' },
    { label: 'Voting CSI', value: accountData.voting_csi ? accountData.voting_csi.toFixed(1) : 'N/A' },
    { label: 'Selfvote Rate', value: formatPercentage(accountData.selfvote_rate) }
  ];

  const balanceStats = [
    { label: 'STEEM Balance', value: formatBalance(accountData.balance_steem, 'STEEM') },
    { label: 'SBD Balance', value: formatBalance(accountData.balance_sbd, 'SBD') },
    { label: 'Savings STEEM', value: formatBalance(accountData.savings_steem, 'STEEM') },
    { label: 'Savings SBD', value: formatBalance(accountData.savings_sbd, 'SBD') },
    { label: 'Reward STEEM', value: formatBalance(accountData.rewards_steem, 'STEEM') },
    { label: 'Reward SBD', value: formatBalance(accountData.rewards_sbd, 'SBD') },
    { label: 'Reward Vests', value: formatBalance(accountData.rewards_vests, 'VESTS') },
    { label: 'Own Vests', value: `${(accountData.vests_own / 1000000).toFixed(3)} MV` },
    { label: 'Delegated In', value: `${(accountData.vests_in / 1000000).toFixed(3)} MV` },
    { label: 'Delegated Out', value: `${(accountData.vests_out / 1000000).toFixed(3)} MV` },
    { label: 'Steem Power', value: formatSteemPower(accountData.vests_own) }
  ];

  const manaStats = [
    { label: 'Upvote Mana', value: formatPercentage(accountData.upvote_mana_percent) },
    { label: 'Upvote Mana Current', value: (accountData.upvote_mana_current / 1000000000000).toFixed(2) + 'T' },
    { label: 'Upvote Mana Max', value: (accountData.upvote_mana_max / 1000000000000).toFixed(2) + 'T' },
    { label: 'Downvote Mana', value: formatPercentage(accountData.downvote_mana_percent) },
    { label: 'Downvote Mana Current', value: (accountData.downvote_mana_current / 1000000000000).toFixed(2) + 'T' },
    { label: 'Downvote Mana Max', value: (accountData.downvote_mana_max / 1000000000000).toFixed(2) + 'T' },
    { label: 'RC Mana', value: formatPercentage(accountData.rc_mana_percent) },
    { label: 'RC Mana Current', value: (accountData.rc_mana_current / 1000000000000).toFixed(2) + 'T' },
    { label: 'RC Mana Max', value: (accountData.rc_mana_max / 1000000000000).toFixed(2) + 'T' }
  ];

  const rewardsStats = [
    { label: 'Curation Rewards', value: formatBalance(accountData.curation_rewards / 1000, 'STEEM') },
    { label: 'Author Rewards', value: formatBalance(accountData.posting_rewards / 1000, 'STEEM') },
    { label: 'Mined', value: formatBalance(accountData.mined, 'STEEM') },
    { label: 'SBD Seconds', value: accountData.sbd_seconds || '0' },
    { label: 'Savings SBD Seconds', value: accountData.savings_sbd_seconds || '0' }
  ];

  const activityStats = [
    { label: 'Root Posts', value: accountData.count_root_posts || 0 },
    { label: 'Active Posts', value: accountData.count_active_posts || 0 },
    { label: 'Comments', value: accountData.count_comments || 0 },
    { label: 'Replies', value: accountData.count_replies || 0 },
    { label: 'Upvotes Given', value: accountData.count_upvotes || 0 },
    { label: 'Upvotes Received', value: accountData.count_upvoted || 0 },
    { label: 'Downvotes Given', value: accountData.count_downvotes || 0 },
    { label: 'Downvotes Received', value: accountData.count_downvoted || 0 },
    { label: 'Followers', value: accountData.count_followers || 0 },
    { label: 'Following', value: accountData.count_following || 0 }
  ];

  const powerdownStats = [
    { label: 'Powerdown Amount', value: formatSteemPower(accountData.powerdown) },
    { label: 'Powerdown Done', value: formatSteemPower(accountData.powerdown_done) },
    { label: 'Powerdown Rate', value: formatSteemPower(accountData.powerdown_rate) },
    { label: 'Next Powerdown', value: accountData.next_powerdown ? new Date(accountData.next_powerdown * 1000).toLocaleString() : 'None' },
    { label: 'Withdraw Routes', value: accountData.withdraw_routes || 0 },
    { label: 'Savings Withdrawals', value: accountData.savings_withdraw_requests || 0 },
    { label: 'Pending Claimed Accounts', value: accountData.pending_claimed_accounts || 0 }
  ];

  const timestampStats = [
    { label: 'Account Created', value: new Date(accountData.created * 1000).toLocaleString() },
    { label: 'Last Action', value: new Date(accountData.last_action * 1000).toLocaleString() },
    { label: 'Last Comment', value: accountData.last_comment ? new Date(accountData.last_comment * 1000).toLocaleString() : 'Never' },
    { label: 'Last Root Post', value: accountData.last_root_post ? new Date(accountData.last_root_post * 1000).toLocaleString() : 'Never' },
    { label: 'Last Vote', value: accountData.last_vote ? new Date(accountData.last_vote * 1000).toLocaleString() : 'Never' },
    { label: 'Last Account Update', value: accountData.last_account_update ? new Date(accountData.last_account_update * 1000).toLocaleString() : 'Never' },
    { label: 'Last Owner Update', value: accountData.last_owner_update ? new Date(accountData.last_owner_update * 1000).toLocaleString() : 'Never' },
    { label: 'Last Sync', value: accountData.last_sync ? new Date(accountData.last_sync * 1000).toLocaleString() : 'Never' }
  ];

  const securityStats = [
    { label: 'Can Vote', value: accountData.can_vote ? 'Yes' : 'No' },
    { label: 'Owner Key Auths', value: accountData.owner_key_auths?.length || 0 },
    { label: 'Active Key Auths', value: accountData.active_key_auths?.length || 0 },
    { label: 'Posting Key Auths', value: accountData.posting_key_auths?.length || 0 },
    { label: 'Owner Weight Threshold', value: accountData.owner_weight_threshold || 0 },
    { label: 'Active Weight Threshold', value: accountData.active_weight_threshold || 0 },
    { label: 'Posting Weight Threshold', value: accountData.posting_weight_threshold || 0 },
    { label: 'Memo Key', value: accountData.memo_key ? accountData.memo_key.substring(0, 20) + '...' : 'N/A' }
  ];

  return (
    <div className="dashboard-container">
      {/* Search Section - matching Home page design */}
      <section className="home-search-section">
        <div className="home-search-container">
          <form onSubmit={handleSearch} className="home-search-wrapper">
            <input
              type="text"
              placeholder="Search blocks, transactions, or accounts..."
              className="home-search-input"
              value={searchQuery}
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

      {/* Account Profile Section */}
      <section className="account-profile-section">
            {/* Modern Profile Card */}
            <div className="modern-profile-card">
              {/* Cover Image Section - Facebook Style */}
              <div className="cover-section">
                <img
                  src={profileData.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80'}
                  alt="Profile cover"
                  className="cover-image"
                  onError={(e) => {
                    // Fallback to a different default image if the primary fails
                    e.target.src = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80';
                  }}
                />
              </div>

              {/* Profile Info Section */}
              <div className="profile-info-section">
                <div className="profile-header-row">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-modern">
                      {profileData.profile_image ? (
                        <img
                          src={profileData.profile_image}
                          alt={`${accountName}'s avatar`}
                          onError={(e) => {
                            e.target.src = `https://steemitimages.com/u/${accountName}/avatar/large`;
                          }}
                        />
                      ) : (
                        <img
                          src={`https://steemitimages.com/u/${accountName}/avatar/large`}
                          alt={`${accountName}'s avatar`}
                          onError={(e) => {
                            e.target.src = '/favicon.ico';
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Profile Name in Cover Area */}
                  <div className="profile-cover-name">
                    <div className="cover-name-section">
                      <div className="cover-name-row">
                        <h2 className="cover-display-name">
                          {profileData.name || accountName}
                        </h2>
                        <div className="reputation-circle">
                          {accountData.reputation?.toFixed(0) || '25'}
                        </div>
                      </div>
                      <div className="cover-stats">
                        <span className="cover-stat-item">
                          <span className="cover-stat-number">{accountData.count_root_posts || 0}</span>
                          <span className="cover-stat-label">Posts</span>
                        </span>
                        <span className="cover-stat-item">
                          <span className="cover-stat-number">{accountData.count_comments || 0}</span>
                          <span className="cover-stat-label">Comments</span>
                        </span>
                        <span className="cover-stat-item">
                          <span className="cover-stat-number">{accountData.count_followers || 0}</span>
                          <span className="cover-stat-label">Followers</span>
                        </span>
                        <span className="cover-stat-item">
                          <span className="cover-stat-number">{accountData.count_following || 0}</span>
                          <span className="cover-stat-label">Following</span>
                        </span>
                      </div>
                      {(profileData.about || profileData.website || profileData.location || accountData.created || accountData.last_action) && (
                        <div className="profile-about">
                          {profileData.about && (
                            <p className="about-text">{profileData.about}</p>
                          )}
                          <div className="profile-details">
                            {profileData.website && (
                              <span className="profile-detail">
                                <span className="detail-icon">🌐</span>
                                <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="detail-link">
                                  {profileData.website}
                                </a>
                              </span>
                            )}
                            {profileData.location && (
                              <span className="profile-detail">
                                <span className="detail-icon">🌍</span>
                                <span className="detail-text">{profileData.location}</span>
                              </span>
                            )}
                            {accountData.created && (
                              <span className="profile-detail">
                                <span className="detail-icon">📅</span>
                                <span className="detail-text">
                                  Joined {new Date(accountData.created * 1000).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long'
                                  })}
                                </span>
                              </span>
                            )}
                            {accountData.last_action && (
                              <span className="profile-detail">
                                <span className="detail-icon">⚡</span>
                                <span className="detail-text">{formatTimeAgo(accountData.last_action)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </section>

      {/* Account Statistics Section */}
      <section className="account-stats-section">
            <h2 className="section-title">Complete Account Information</h2>
            <div className="stats-grid">
              {/* Basic Account Info */}
              <div className="stats-card">
                <h3 className="stats-title">Basic Information</h3>
                <div className="stats-list">
                  {basicStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Balances & Assets</h3>
                <div className="stats-list">
                  {balanceStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mana Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Mana & Resources</h3>
                <div className="stats-list">
                  {manaStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Rewards & Earnings</h3>
                <div className="stats-list">
                  {rewardsStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Activity & Engagement</h3>
                <div className="stats-list">
                  {activityStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Powerdown Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Powerdown & Delegations</h3>
                <div className="stats-list">
                  {powerdownStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamp Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Timeline & Activity Dates</h3>
                <div className="stats-list">
                  {timestampStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Stats */}
              <div className="stats-card">
                <h3 className="stats-title">Security & Keys</h3>
                <div className="stats-list">
                  {securityStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      </section>

      {/* Witness Votes Section */}
      {accountData.witness_votes && accountData.witness_votes.length > 0 && (
        <section className="witness-votes-section">
              <h3 className="section-title">Witness Votes ({accountData.witness_votes.length}/30)</h3>
              <div className="witness-votes-grid">
                {accountData.witness_votes.map((witness, index) => (
                  <div key={index} className="witness-vote-item">
                    <span className="witness-rank">#{index + 1}</span>
                    <span className="witness-name">{witness}</span>
                  </div>
                ))}
              </div>
        </section>
      )}

      {/* Account History Section */}
      {accountHistory && accountHistory.length > 0 && (
        <section className="account-history-section">
              <h3 className="history-title">Recent Activity</h3>
              <div className="history-list">
                {accountHistory.slice(0, 10).map((historyItem, idx) => {
                  // Account history format: [index, { timestamp, op: [operation_type, operation_data] }]
                  if (!historyItem || !Array.isArray(historyItem) || historyItem.length < 2) {
                    return null;
                  }

                  const [historyIndex, operation] = historyItem;

                  if (!operation || !operation.op || !Array.isArray(operation.op)) {
                    return null;
                  }

                  const [operationType, operationData] = operation.op;
                  const timestamp = operation.timestamp;

                  return (
                    <div key={idx} className="history-item">
                      <div className="history-operation">
                        <span className="operation-type">{operationType || 'Unknown'}</span>
                        <span className="operation-index">#{historyIndex}</span>
                        <span className="operation-time">
                          {timestamp ? new Date(timestamp + 'Z').toLocaleString() : 'Unknown time'}
                        </span>
                      </div>
                      <div className="operation-details">
                        {operationData ? JSON.stringify(operationData, null, 2).substring(0, 200) + '...' : 'No data available'}
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
        </section>
      )}
    </div>
  );
};

export default AccountResult;
