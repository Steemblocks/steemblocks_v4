import React, { useState, useEffect, useCallback } from 'react';
import AccountLink from '../../components/Common/AccountLink';
import './styles.css'

const CommunityData = () => {
  const [flag, setFlag] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [communityImages, setCommunityImages] = useState({
    profile: null,
    cover: null
  });
  const [imagesLoading, setImagesLoading] = useState(false);
  const [communityRoles, setCommunityRoles] = useState({
    owner: null,
    admins: [],
    moderators: [],
    members: [],
    banned: [],
    muted: []
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Helper functions defined first to avoid hoisting issues
  const validateInput = useCallback((input) => {
    if (!input || input.trim() === '') {
      return 'Please enter a community ID';
    }
    if (!input.startsWith('hive-') && !/^[a-zA-Z0-9.-]+$/.test(input)) {
      return 'Please enter a valid community ID (e.g., hive-123456 or community-id)';
    }
    return null;
  }, []);

  const fetchCommunityImages = useCallback(async (communityAccount) => {
    if (!communityAccount) return;

    setImagesLoading(true);
    try {
      const response = await fetch(`https://sds0.steemworld.org/accounts_api/getAccount/${communityAccount}`);
      const data = await response.json();

      if (data && data.profile_image) {
        setCommunityImages({
          profile: data.profile_image || `https://steemitimages.com/u/${communityAccount}/avatar/medium`,
          cover: data.cover_image || null
        });
      } else {
        // Fallback to default Steemit avatar
        setCommunityImages({
          profile: `https://steemitimages.com/u/${communityAccount}/avatar/medium`,
          cover: null
        });
      }
    } catch (error) {
      console.error('Error fetching community images:', error);
      // Use fallback image on error
      setCommunityImages({
        profile: `https://steemitimages.com/u/${communityAccount}/avatar/medium`,
        cover: null
      });
    } finally {
      setImagesLoading(false);
    }
  }, []);

  const parseCommunityRoles = useCallback((rolesData) => {
    if (!rolesData || !rolesData.rows) {
      return {
        owner: null,
        admins: [],
        moderators: [],
        members: [],
        banned: [],
        muted: []
      };
    }

    const roles = {
      owner: null,
      admins: [],
      moderators: [],
      members: [],
      banned: [],
      muted: []
    };

    rolesData.rows.forEach(row => {
      const [created, account, title, role] = row;
      const userData = {
        account,
        title: title || '',
        created,
        joinedDate: new Date(created * 1000).getFullYear()
      };

      switch (role) {
        case 'owner':
          roles.owner = userData;
          break;
        case 'admin':
          roles.admins.push(userData);
          break;
        case 'mod':
          roles.moderators.push(userData);
          break;
        case 'member':
          roles.members.push(userData);
          break;
        case 'banned':
          roles.banned.push(userData);
          break;
        case 'muted':
          roles.muted.push(userData);
          break;
        default:
          // Handle unknown roles
          break;
      }
    });

    return roles;
  }, []);

  // Separate function for performing search that can be reused
  const performSearch = useCallback(async (communityId) => {
    const validationError = validateInput(communityId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://sds1.steemworld.org/communities_api/getCommunity/${communityId}`);
      const data = await response.json();

      if (data.result) {
        setItem(data.result);
        setFlag(true);
        // Parse and set community roles
        const rolesData = parseCommunityRoles(data.result.roles);
        setCommunityRoles(rolesData);
        // Fetch community images after getting community data
        await fetchCommunityImages(data.result.account);

        // Update URL with search parameter
        const newUrl = `${window.location.pathname}?community=${encodeURIComponent(communityId)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      } else {
        setItem(null);
        setFlag(true);
        setCommunityImages({ profile: null, cover: null });
        setCommunityRoles({
          owner: null,
          admins: [],
          moderators: [],
          members: [],
          banned: [],
          muted: []
        });
        setError('Community not found. Please check the community ID and try again.');

        // Remove community parameter from URL if search failed
        const newUrl = window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.error('Error fetching community data:', e);
      setError('Failed to fetch community data. Please try again later.');
      setFlag(true);
      setCommunityImages({ profile: null, cover: null });

      // Remove community parameter from URL on error
      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } finally {
      setLoading(false);
    }
  }, [validateInput, parseCommunityRoles, fetchCommunityImages]);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = urlParams.get('community');

    if (communityId) {
      setSearchText(communityId);
      // Auto-search if there's a community ID in the URL
      performSearch(communityId);
    }
  }, [performSearch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const communityId = urlParams.get('community');

      if (communityId) {
        setSearchText(communityId);
        performSearch(communityId);
      } else {
        // Clear the search state if no community in URL
        setSearchText('');
        setFlag(false);
        setItem(null);
        setError(null);
        setCommunityImages({ profile: null, cover: null });
        setCommunityRoles({
          owner: null,
          admins: [],
          moderators: [],
          members: [],
          banned: [],
          muted: []
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [performSearch]);

  const inputHandler = (e) => {
    const value = e.target.value.toLowerCase();
    setFlag(false);
    setError(null);
    setSearchText(value);

    // Clear URL parameter when user starts typing a new search
    if (window.location.search.includes('community=')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  };

  const handleSearch = async () => {
    await performSearch(searchText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getRankColor = (rank) => {
    if (rank <= 10) return '#22c55e';
    if (rank <= 50) return '#f59e0b';
    if (rank <= 100) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">STEEM Communities</h1>
        <p className="dashboard-subtitle">
          Search and explore Steem blockchain communities
        </p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder={isMobile ? "Community ID (hive-129948)" : "Enter community ID (e.g., hive-129948, hive-167922)"}
              value={searchText}
              onChange={inputHandler}
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              className={`search-button ${loading ? 'loading' : ''}`}
              onClick={handleSearch}
              disabled={loading || !searchText.trim()}
              title={loading ? 'Searching...' : 'Search for community'}
            >
              {loading ? (
                <>
                  <span className="inline-spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  🔍 Search
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {flag && !item && !error && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No Community Found</h3>
          <p>The community you searched for doesn't exist or might be private.</p>
          <div className="search-tips">
            <h4>Search Tips:</h4>
            <ul>
              <li>Use the exact community ID (e.g., "hive-129948")</li>
              <li>Check for typos in the community ID</li>
              <li>Some communities might be private or restricted</li>
            </ul>
          </div>
        </div>
      )}

      {flag && item && (
        <div className="community-results">
          {/* Community Cover Image */}
          {communityImages.cover && (
            <div className="community-cover">
              <img
                src={communityImages.cover}
                alt="Community Cover"
                className="cover-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Community Header Card */}
          <div className="community-header-card">
            <div className="community-avatar">
              {imagesLoading ? (
                <div className="avatar-loading">
                  <div className="avatar-spinner"></div>
                </div>
              ) : (
                <img
                  src={communityImages.profile || `https://steemitimages.com/u/${item.account}/avatar/medium`}
                  alt={`${item.account} avatar`}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = `https://steemitimages.com/u/${item.account}/avatar/medium`;
                  }}
                />
              )}
            </div>
            <div className="community-info">
              <h2 className="community-title">{item.title || 'Untitled Community'}</h2>
              {item.about && (
                <p className="community-subtitle">{item.about}</p>
              )}
              <AccountLink
                account={item.account}
                className="community-account"
                showAt={true}
              />
              <div className="community-badges">
                <span className="badge badge-primary">{item.type || 'Community'}</span>
                <span
                  className="badge badge-rank"
                  style={{ backgroundColor: getRankColor(item.rank) }}
                >
                  Rank #{item.rank || 'N/A'}
                </span>
                {item.lang && (
                  <span className="badge badge-lang">🌐 {item.lang.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="community-stats-grid">
            <div className="community-stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{formatNumber(item.count_subs)}</div>
                <div className="stat-label">Subscribers</div>
              </div>
            </div>

            <div className="community-stat-card">
              <div className="stat-icon">✍️</div>
              <div className="stat-info">
                <div className="stat-number">{formatNumber(item.count_authors)}</div>
                <div className="stat-label">Active Authors</div>
              </div>
            </div>

            <div className="community-stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-number">#{item.rank || 'N/A'}</div>
                <div className="stat-label">Community Rank</div>
              </div>
            </div>
          </div>

          {/* Community Description */}
          {item.description && (
            <div className="community-description-card">
              <h3>📝 About This Community</h3>
              <div className="description-content">
                <p>{item.description}</p>
              </div>
            </div>
          )}

          {/* Community Rules */}
          {item.flag_text && (
            <div className="community-rules-card">
              <h3>📋 Community Rules</h3>
              <div className="rules-content">
                <p>{item.flag_text}</p>
              </div>
            </div>
          )}

          {/* Leadership Board */}
          <div className="leadership-board-card">
            <h3>👑 Community Leadership</h3>

            {/* Owner Section */}
            {communityRoles.owner && (
              <div className="leadership-section">
                <h4 className="leadership-section-title">👨‍💼 Owner</h4>
                <div className="leadership-member">
                  <img
                    src={`https://steemitimages.com/u/${communityRoles.owner.account}/avatar/small`}
                    alt={`${communityRoles.owner.account} avatar`}
                    className="leadership-avatar"
                    onError={(e) => {
                      e.target.src = `https://steemitimages.com/u/${communityRoles.owner.account}/avatar/small`;
                    }}
                  />
                  <div className="leadership-info">
                    <AccountLink
                      account={communityRoles.owner.account}
                      className="leadership-username"
                      showAt={true}
                    />
                    <span className="leadership-role-badge owner-badge">Owner</span>
                    <span className="leadership-joined">Since: {communityRoles.owner.joinedDate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Admins Section */}
            {communityRoles.admins.length > 0 && (
              <div className="leadership-section">
                <h4 className="leadership-section-title">⚡ Administrators ({communityRoles.admins.length})</h4>
                <div className="leadership-grid">
                  {communityRoles.admins.map((admin, index) => (
                    <div key={index} className="leadership-member">
                      <img
                        src={`https://steemitimages.com/u/${admin.account}/avatar/small`}
                        alt={`${admin.account} avatar`}
                        className="leadership-avatar"
                        onError={(e) => {
                          e.target.src = `https://steemitimages.com/u/${admin.account}/avatar/small`;
                        }}
                      />
                      <div className="leadership-info">
                        <AccountLink
                          account={admin.account}
                          className="leadership-username"
                          showAt={true}
                        />
                        <span className="leadership-role-badge admin-badge">Admin</span>
                        <span className="leadership-joined">Since: {admin.joinedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderators Section */}
            {communityRoles.moderators.length > 0 && (
              <div className="leadership-section">
                <h4 className="leadership-section-title">🛡️ Moderators ({communityRoles.moderators.length})</h4>
                <div className="leadership-grid">
                  {communityRoles.moderators.map((moderator, index) => (
                    <div key={index} className="leadership-member">
                      <img
                        src={`https://steemitimages.com/u/${moderator.account}/avatar/small`}
                        alt={`${moderator.account} avatar`}
                        className="leadership-avatar"
                        onError={(e) => {
                          e.target.src = `https://steemitimages.com/u/${moderator.account}/avatar/small`;
                        }}
                      />
                      <div className="leadership-info">
                        <AccountLink
                          account={moderator.account}
                          className="leadership-username"
                          showAt={true}
                        />
                        <span className="leadership-role-badge mod-badge">Moderator</span>
                        <span className="leadership-joined">Since: {moderator.joinedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Moderation Lists */}
          {(communityRoles.banned.length > 0 || communityRoles.muted.length > 0) && (
            <div className="moderation-lists-card">
              <h3>🚫 Moderation Status</h3>

              {/* Banned Users */}
              {communityRoles.banned.length > 0 && (
                <div className="moderation-section">
                  <h4 className="moderation-section-title">🚫 Banned Users ({communityRoles.banned.length})</h4>
                  <div className="moderation-list">
                    {communityRoles.banned.map((user, index) => (
                      <div key={index} className="moderation-member banned">
                        <img
                          src={`https://steemitimages.com/u/${user.account}/avatar/small`}
                          alt={`${user.account} avatar`}
                          className="moderation-avatar"
                          onError={(e) => {
                            e.target.src = `https://steemitimages.com/u/${user.account}/avatar/small`;
                          }}
                        />
                        <div className="moderation-info">
                          <AccountLink
                            account={user.account}
                            className="moderation-username"
                            showAt={true}
                          />
                          <span className="moderation-status-badge banned-badge">Banned</span>
                          <span className="moderation-date">Since: {user.joinedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Muted Users */}
              {communityRoles.muted.length > 0 && (
                <div className="moderation-section">
                  <h4 className="moderation-section-title">🔇 Muted Users ({communityRoles.muted.length})</h4>
                  <div className="moderation-list">
                    {communityRoles.muted.map((user, index) => (
                      <div key={index} className="moderation-member muted">
                        <img
                          src={`https://steemitimages.com/u/${user.account}/avatar/small`}
                          alt={`${user.account} avatar`}
                          className="moderation-avatar"
                          onError={(e) => {
                            e.target.src = `https://steemitimages.com/u/${user.account}/avatar/small`;
                          }}
                        />
                        <div className="moderation-info">
                          <AccountLink
                            account={user.account}
                            className="moderation-username"
                            showAt={true}
                          />
                          <span className="moderation-status-badge muted-badge">Muted</span>
                          <span className="moderation-date">Since: {user.joinedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Community Details */}
          <div className="community-details-card">
            <h3>📊 Community Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Community ID:</span>
                <span className="detail-value">{item.account}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Display Title:</span>
                <span className="detail-value">{item.title || 'No title set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{item.type || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Language:</span>
                <span className="detail-value">{item.lang ? item.lang.toUpperCase() : 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unique ID:</span>
                <span className="detail-value">{item.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {item.created ? new Date(item.created * 1000).getFullYear() : 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">NSFW:</span>
                <span className="detail-value">{item.is_nsfw ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityData;