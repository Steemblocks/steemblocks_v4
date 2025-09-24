import React, { useState } from 'react';
import Loading from '../../components/Common/Loading';
import './styles.css';

const ContentHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showDifferences, setShowDifferences] = useState(new Set());

  const inputHandler = (e) => {
    setSearchText(e.target.value);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setError('Please enter a valid Steemit post URL');
      return;
    }

    setLoading(true);
    setError(null);
    setHistoryData(null);

    try {
      // Parse the URL to extract account and permlink
      const dividedString = searchText.split('/');
      const lengthString = dividedString.length;
      const accountRaw = dividedString[lengthString - 2];
      const account = accountRaw.startsWith('@') ? accountRaw.slice(1) : accountRaw;
      const permlink = dividedString[lengthString - 1];

      if (!account || !permlink) {
        throw new Error('Invalid URL format. Please use: https://steemit.com/@username/post-title');
      }

      const response = await fetch(
        `https://sds1.steemworld.org/content_history_api/getContentHistory/${account}/${permlink}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch content history');
      }

      const data = await response.json();

      if (data.result && data.result.rows && data.result.rows.length > 0) {
        // Debug: Log the complete data structure
        data.result.rows[0].forEach((field, index) => {
        });

        setHistoryData({
          account,
          permlink,
          versions: data.result.rows
        });
      } else {
        setError('No content history found for this post. The post may not exist or may not have been edited.');
      }
    } catch (err) {
      console.error('Error fetching content history:', err);
      setError(err.message || 'Failed to fetch content history. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVersion = (index) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVersions(newExpanded);
  };

  const toggleDifference = (index) => {
    const newShowDiff = new Set(showDifferences);
    if (newShowDiff.has(index)) {
      newShowDiff.delete(index);
    } else {
      newShowDiff.add(index);
    }
    setShowDifferences(newShowDiff);
  };

  const formatDate = (versionArray, fieldIndex = null) => {
    try {
      let timestamp;

      // If a specific field index is provided, use it
      if (fieldIndex !== null) {
        timestamp = versionArray[fieldIndex];
      } else {
        // Search for the timestamp in the version array
        timestamp = findTimestampInVersion(versionArray);
      }

      // Debug: Log what we're trying to parse
      let date;

      if (typeof timestamp === 'string') {
        // Handle ISO string formats or other string formats
        if (timestamp.includes('T') || timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-')) {
          date = new Date(timestamp);
        } else if (timestamp.match(/^\d{4}-\d{2}-\d{2}/)) {
          // Looks like a date string
          date = new Date(timestamp);
        } else {
          // Try parsing directly first
          date = new Date(timestamp);
          // If invalid and doesn't have timezone info, add Z for UTC
          if (isNaN(date.getTime())) {
            date = new Date(timestamp + 'Z');
          }
        }
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamp (in seconds or milliseconds)
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      } else {
        console.error('Unexpected timestamp type:', typeof timestamp, timestamp);
        return 'Unknown Date Format';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Failed to parse timestamp:', timestamp);
        return 'Invalid Date';
      }

      // Format similar to the other tool's output
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date Error';
    }
  };

  const findTimestampInVersion = (versionArray) => {
    // Look for timestamp in different possible positions
    for (let i = 0; i < versionArray.length; i++) {
      const field = versionArray[i];
      if (typeof field === 'string') {
        // Check if this looks like a timestamp
        if (field.match(/^\d{4}-\d{2}-\d{2}/) ||
            field.includes('T') ||
            field.includes('Z') ||
            field.match(/\d{4}.\d{2}.\d{2}/)) {
          return field;
        }
      } else if (typeof field === 'number' && field > 1000000000) {
        // Looks like a Unix timestamp
        return field;
      }
    }
    return null;
  };

  const getTimeSinceEdit = (currentTimestamp, previousTimestamp) => {
    try {
      // Parse timestamps the same way as formatDate
      let current, previous;

      if (typeof currentTimestamp === 'string') {
        current = currentTimestamp.includes('Z') || currentTimestamp.includes('+') || currentTimestamp.includes('-')
          ? new Date(currentTimestamp)
          : new Date(currentTimestamp + 'Z');
      } else {
        current = new Date(currentTimestamp < 10000000000 ? currentTimestamp * 1000 : currentTimestamp);
      }

      if (typeof previousTimestamp === 'string') {
        previous = previousTimestamp.includes('Z') || previousTimestamp.includes('+') || previousTimestamp.includes('-')
          ? new Date(previousTimestamp)
          : new Date(previousTimestamp + 'Z');
      } else {
        previous = new Date(previousTimestamp < 10000000000 ? previousTimestamp * 1000 : previousTimestamp);
      }

      if (isNaN(current.getTime()) || isNaN(previous.getTime())) {
        return null;
      }

      const diffMs = Math.abs(current.getTime() - previous.getTime());
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffYears > 0) {
        return `${diffYears} year${diffYears !== 1 ? 's' : ''} later`;
      } else if (diffMonths > 0) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} later`;
      } else if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} later`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} later`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} later`;
      } else {
        return 'Less than a minute later';
      }
    } catch (error) {
      console.error('Time calculation error:', error);
      return null;
    }
  };

  const getVersionType = (index, versions) => {
    if (index === versions.length - 1) {
      return { type: 'original', icon: '📄', label: 'Original Post' };
    } else {
      return { type: 'edit', icon: '✏️', label: `Edit #${versions.length - index - 1}` };
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const extractTags = (jsonMetadata) => {
    try {
      if (typeof jsonMetadata === 'string') {
        const parsed = JSON.parse(jsonMetadata);
        return parsed.tags || [];
      }
      return jsonMetadata?.tags || [];
    } catch {
      return [];
    }
  };

  const renderHTMLContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Process the content to ensure proper image handling
    let processedContent = htmlContent;

    // Convert markdown-style images to HTML if needed
    processedContent = processedContent.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />'
    );

    // Ensure all img tags have proper styling
    processedContent = processedContent.replace(
      /<img([^>]*?)(?:\s+style="[^"]*")?([^>]*?)>/g,
      '<img$1 style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"$2>'
    );

    // Convert YouTube links to embedded videos
    processedContent = processedContent.replace(
      /https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:[&?][\w=&-]*)?/g,
      '<div class="video-container" style="margin: 1rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/$1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px;" allowfullscreen></iframe></div>'
    );

    processedContent = processedContent.replace(
      /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(?:\?t=([0-9hmns]+))?/g,
      '<div class="video-container" style="margin: 1rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/$1$2" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px;" allowfullscreen></iframe></div>'
    );

    // Create a safe HTML rendering function
    return (
      <div
        className="html-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  return (
    <div className="content-history-container">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Check Content History</h1>
        <p className="page-subtitle">
          Track and compare different versions of Steemit posts to see how content has evolved over time
        </p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="url-input-group">
            <div className="input-wrapper">
              <input
                type="text"
                className="url-input"
                placeholder="https://steemit.com/@username/post-title"
                value={searchText}
                onChange={inputHandler}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <div className="input-icon">🔗</div>
            </div>
            <button
              className={`search-button ${loading ? 'loading' : ''}`}
              onClick={handleSearch}
              disabled={loading || !searchText.trim()}
            >
              {loading ? (
                <>
                  <span className="inline-spinner"></span>
                  Checking...
                </>
              ) : (
                <>
                  🔍 Check History
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

      {/* Loading Section */}
      {loading && (
        <Loading
          message="Checking content history..."
          size="medium"
          variant="primary"
        />
      )}

      {/* Results Section */}
      {historyData && (
        <div className="history-results">
          <div className="results-header">
            <h2 className="results-title">
              Content History for @{historyData.account}/{historyData.permlink}
            </h2>
            <div className="versions-count">
              {historyData.versions.length} Version{historyData.versions.length !== 1 ? 's' : ''} Found
            </div>
          </div>

          <div className="versions-list">
            {historyData.versions.map((version, index) => {
              const versionType = getVersionType(index, historyData.versions);
              const timeSinceEdit = index < historyData.versions.length - 1
                ? getTimeSinceEdit(
                    findTimestampInVersion(version),
                    findTimestampInVersion(historyData.versions[index + 1])
                  )
                : null;

              return (
                <div key={index} className="version-card">
                  <div className="version-header">
                    <div className="version-info">
                      <div className="version-badge">
                        <span className="version-icon">{versionType.icon}</span>
                        {versionType.label}
                      </div>
                      <div className="version-dates">
                        <div className="version-date">
                          <span className="date-label">
                            {versionType.type === 'original' ? 'Published:' : 'Edited:'}
                          </span>
                          {formatDate(version)}
                        </div>
                        {timeSinceEdit && (
                          <div className="edit-timing">
                            <span className="timing-icon">⏱️</span>
                            {timeSinceEdit}
                          </div>
                        )}
                      </div>
                    </div>
                  <div className="version-actions">
                    <button
                      className="action-button difference-btn"
                      onClick={() => toggleDifference(index)}
                      title="Show content differences"
                    >
                      <span className="btn-icon">📊</span>
                      Show Difference
                    </button>
                    <button
                      className="action-button reveal-btn"
                      onClick={() => toggleVersion(index)}
                      title={expandedVersions.has(index) ? 'Hide content' : 'Show full content'}
                    >
                      <span className="btn-icon">
                        {expandedVersions.has(index) ? '🔽' : '▶️'}
                      </span>
                      {expandedVersions.has(index) ? 'Close' : 'Reveal'}
                    </button>
                  </div>
                </div>

                {showDifferences.has(index) && (
                  <div className="difference-section">
                    <div className="difference-header">
                      <h4>📊 Content Analysis</h4>
                      <button
                        className="close-btn"
                        onClick={() => toggleDifference(index)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="difference-stats">
                      <div className="stat-item">
                        <span className="stat-label">Title Length:</span>
                        <span className="stat-value">{version[2]?.length || 0} characters</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Body Length:</span>
                        <span className="stat-value">{version[3]?.length || 0} characters</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Tags:</span>
                        <div className="tags-container">
                          {extractTags(version[4]).map((tag, tagIndex) => (
                            <span key={tagIndex} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Found Timestamp:</span>
                        <span className="stat-value debug-info">
                          {findTimestampInVersion(version) || 'Not found'}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">All Fields:</span>
                        <div className="debug-fields">
                          {version.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="debug-field">
                              <strong>[{fieldIndex}]:</strong> {
                                typeof field === 'object' ? JSON.stringify(field).substring(0, 50) + '...'
                                : field?.toString().substring(0, 50) + (field?.toString().length > 50 ? '...' : '')
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {expandedVersions.has(index) && (
                  <div className="version-content">
                    <div className="content-section">
                      <h4 className="content-header">📝 Title</h4>
                      <div className="content-text title-text">
                        {version[2] || 'No title'}
                      </div>
                    </div>

                    <div className="content-section">
                      <h4 className="content-header">📄 Content</h4>
                      <div className="content-text body-text">
                        {version[3] ? (
                          // Always try to render as HTML since Steemit content often contains markdown/HTML
                          renderHTMLContent(version[3])
                        ) : 'No content'}
                      </div>
                    </div>

                    {extractTags(version[4]).length > 0 && (
                      <div className="content-section">
                        <h4 className="content-header">🏷️ Tags</h4>
                        <div className="tags-container">
                          {extractTags(version[4]).map((tag, tagIndex) => (
                            <span key={tagIndex} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!expandedVersions.has(index) && (
                  <div className="version-preview">
                    <h4 className="preview-title">{truncateText(version[2], 100)}</h4>
                    <div className="preview-body">
                      {version[3] ? (
                        // Always try to render as HTML for preview too
                        renderHTMLContent(truncateText(version[3], 300))
                      ) : 'No content'}
                    </div>
                    {extractTags(version[4]).length > 0 && (
                      <div className="preview-tags">
                        {extractTags(version[4]).slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag small">{tag}</span>
                        ))}
                        {extractTags(version[4]).length > 3 && (
                          <span className="tag more">+{extractTags(version[4]).length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!historyData && !loading && !error && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No Content History Searched Yet</h3>
          <p>Enter a Steemit post URL above to view its edit history and compare different versions.</p>
          <div className="search-tips">
            <h4>📋 How to use:</h4>
            <ul>
              <li>Copy the full URL of any Steemit post</li>
              <li>Paste it in the search box above</li>
              <li>Click "Check History" to see all versions</li>
              <li>Use "Show Difference" to analyze changes</li>
              <li>Use "Reveal" to view full content</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentHistory;