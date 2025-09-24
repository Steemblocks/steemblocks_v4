import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/Common/Loading';
import { IoArrowBack, IoTime, IoDocument, IoCopy, IoCheckmark, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaUser, FaHashtag, FaCube } from 'react-icons/fa';
import './styles.css';

const BlockResult = () => {
  const { blockNumber } = useParams();
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [virtualOps, setVirtualOps] = useState([]);
  const [copiedHash, setCopiedHash] = useState('');
  const [expandedTransactions, setExpandedTransactions] = useState(new Set());
  const [expandedOperations, setExpandedOperations] = useState(new Set());
  const [witnessImage, setWitnessImage] = useState('');

  // Format time ago with short format
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const blockTime = new Date(timestamp + 'Z');
    const diffMs = now - blockTime;
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}M`;

    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears}Y`;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp + 'Z');
    return date.toLocaleString();
  };

  // Format vote weight for better representation
  const formatVoteWeight = (weight) => {
    if (!weight) return '';

    const percentage = Math.abs(weight / 100);
    const isUpvote = weight > 0;
    const isDownvote = weight < 0;

    if (isUpvote) {
      return `👍 ${percentage}%`;
    } else if (isDownvote) {
      return `👎 ${percentage}%`;
    }
    return '';
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(type);
      setTimeout(() => setCopiedHash(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Toggle transaction expansion
  const toggleTransaction = (index) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTransactions(newExpanded);
  };

  // Toggle operation expansion
  const toggleOperation = (key) => {
    const newExpanded = new Set(expandedOperations);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedOperations(newExpanded);
  };

  // Fetch witness profile image
  const fetchWitnessImage = async (witnessName) => {
    if (!witnessName) return;

    try {
      const response = await axios.get(
        `https://sds0.steemworld.org/accounts_api/getAccount/${witnessName}`,
        { timeout: 5000 }
      );

      if (response.data && response.data.profile_image) {
        setWitnessImage(response.data.profile_image);
      } else {
        setWitnessImage(`https://steemitimages.com/u/${witnessName}/avatar/small`);
      }
    } catch (error) {
      console.error('Error fetching witness image:', error);
      setWitnessImage(`https://steemitimages.com/u/${witnessName}/avatar/small`);
    }
  };

  // Fetch complete block data
  useEffect(() => {
    const fetchBlockData = async () => {
      if (!blockNumber) return;

      // Validate block number
      const blockNum = parseInt(blockNumber);
      if (isNaN(blockNum) || blockNum <= 0) {
        setError('Invalid block number');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Fetch basic block data
        const blockResponse = await axios.post("https://api.steemit.com", {
          jsonrpc: "2.0",
          method: "condenser_api.get_block",
          params: [blockNum],
          id: 1
        }, { timeout: 10000 });

        if (!blockResponse.data?.result) {
          throw new Error(`Block #${blockNum} not found or doesn't exist yet`);
        }

        const block = blockResponse.data.result;
        setBlockData(block);
        setTransactions(block.transactions || []);
        // Fetch witness profile image
        if (block.witness) {
          fetchWitnessImage(block.witness);
        }

        // Fetch virtual operations
        try {
          const virtualResponse = await axios.post("https://api.steemit.com", {
            jsonrpc: "2.0",
            method: "condenser_api.get_ops_in_block",
            params: [blockNum, true],
            id: 2
          }, { timeout: 10000 });

          if (virtualResponse.data?.result) {
            setVirtualOps(virtualResponse.data.result);
          }
        } catch (virtualError) {
          setVirtualOps([]);
        }

      } catch (err) {
        console.error('Error fetching block data:', err);
        setError(err.message || 'Failed to fetch block data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockData();
  }, [blockNumber]);

  if (loading) {
    return (
      <div className="block-result-container">
        <div className="block-result-content">
          <Loading
            message={`Loading block #${blockNumber}...`}
            size="large"
            variant="primary"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="block-result-container">
        <div className="block-result-content">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Error Loading Block</h2>
            <p className="error-message">{error}</p>
            <Link to="/blocks" className="back-button">
              <IoArrowBack />
              Back to Blocks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block-result-container">
      <div className="block-result-content">
        {/* Header */}
        <div className="block-header">
          <Link to="/blocks" className="back-button">
            <IoArrowBack />
            Back to Blocks
          </Link>
          <div className="block-title-section">
            <h1 className="block-result-title">
              <FaCube className="block-icon" />
              Block #{blockNumber}
            </h1>
            <div className="block-status">
              <span className="status-badge confirmed">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Block Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <IoDocument />
            </div>
            <div className="stat-content">
              <span className="stat-value">{transactions.length}</span>
              <span className="stat-label">Transactions</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaHashtag />
            </div>
            <div className="stat-content">
              <span className="stat-value">{virtualOps.length}</span>
              <span className="stat-label">Virtual Ops</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <IoTime />
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatTimeAgo(blockData?.timestamp)}</span>
              <span className="stat-label">Time Ago</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon witness-avatar">
              {witnessImage ? (
                <img
                  src={witnessImage}
                  alt={`${blockData?.witness || 'Witness'} avatar`}
                  className="witness-profile-image"
                  onError={(e) => {
                    e.target.src = `https://steemitimages.com/u/${blockData?.witness}/avatar/small`;
                  }}
                />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="stat-content">
              <Link to={`/accounts/${blockData?.witness}`} className="witness-link">
                @{blockData?.witness || 'Unknown'}
              </Link>
              <span className="stat-label">Witness</span>
            </div>
          </div>
        </div>

        {/* Block Information Card */}
        <div className="block-info-card">
          <div className="card-header">
            <h2 className="card-title">Block Information</h2>
          </div>
          <div className="block-details-grid">
            <div className="detail-item">
              <span className="detail-label">Block Number</span>
              <span className="detail-value">#{blockNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Timestamp</span>
              <span className="detail-value">{formatTimestamp(blockData?.timestamp)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Block Size</span>
              <span className="detail-value">
                {blockData ? (JSON.stringify(blockData).length / 1024).toFixed(2) + ' KB' : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Operations Count</span>
              <span className="detail-value">
                {transactions.reduce((total, tx) => total + (tx.operations?.length || 0), 0)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Transactions</span>
              <span className="detail-value">{transactions.length}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Virtual Operations</span>
              <span className="detail-value">{virtualOps.length}</span>
            </div>
          </div>
        </div>

        {/* Block Hashes Section */}
        <div className="block-info-card">
          <div className="card-header">
            <h2 className="card-title">Block Hashes</h2>
          </div>
          <div className="hash-list">
            <div className="hash-item">
              <span className="hash-label">Block ID</span>
              <div className="hash-value-container">
                <code className="hash-value">{blockData?.block_id || 'N/A'}</code>
                <button
                  className={`copy-button ${copiedHash === 'block_id' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(blockData?.block_id || '', 'block_id')}
                  title="Copy to clipboard"
                >
                  {copiedHash === 'block_id' ? <IoCheckmark /> : <IoCopy />}
                </button>
              </div>
            </div>
            <div className="hash-item">
              <span className="hash-label">Previous Hash</span>
              <div className="hash-value-container">
                <code className="hash-value">{blockData?.previous || 'N/A'}</code>
                <button
                  className={`copy-button ${copiedHash === 'previous' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(blockData?.previous || '', 'previous')}
                  title="Copy to clipboard"
                >
                  {copiedHash === 'previous' ? <IoCheckmark /> : <IoCopy />}
                </button>
              </div>
            </div>
            <div className="hash-item">
              <span className="hash-label">Transaction Merkle Root</span>
              <div className="hash-value-container">
                <code className="hash-value">{blockData?.transaction_merkle_root || 'N/A'}</code>
                <button
                  className={`copy-button ${copiedHash === 'merkle' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(blockData?.transaction_merkle_root || '', 'merkle')}
                  title="Copy to clipboard"
                >
                  {copiedHash === 'merkle' ? <IoCheckmark /> : <IoCopy />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        {transactions.length > 0 && (
          <div className="block-info-card">
            <div className="card-header">
              <h2 className="card-title">Transactions ({transactions.length})</h2>
            </div>
            <div className="transactions-list">
              {transactions.map((tx, index) => (
                <div key={index} className="transaction-card">
                  <div
                    className="transaction-header"
                    onClick={() => toggleTransaction(index)}
                  >
                    <div className="tx-summary">
                      <div className="tx-index">#{index + 1}</div>
                      <div className="tx-info">
                        <span className="tx-ops-count">
                          {tx.operations?.length || 0} Operation{(tx.operations?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <div className="tx-id-container">
                          <span className="tx-id">{tx.transaction_id || 'No ID'}</span>
                          {tx.transaction_id && (
                            <button
                              className={`copy-button ${copiedHash === `tx_${index}` ? 'copied' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(tx.transaction_id, `tx_${index}`);
                              }}
                              title="Copy transaction ID"
                            >
                              {copiedHash === `tx_${index}` ? <IoCheckmark /> : <IoCopy />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="expand-button">
                      {expandedTransactions.has(index) ? <IoChevronUp /> : <IoChevronDown />}
                    </div>
                  </div>

                  {expandedTransactions.has(index) && (
                    <div className="transaction-details">
                      <div className="operations-list">
                        {tx.operations?.map((op, opIndex) => {
                          const operationType = op[0];
                          const operationData = op[1];
                          const operationKey = `${index}-${opIndex}`;

                          return (
                            <div key={opIndex} className="operation-card">
                              <div
                                className="operation-header"
                                onClick={() => toggleOperation(operationKey)}
                              >
                                <div className="operation-info">
                                  <span className="operation-icon">
                                    {operationType === 'comment' ? '✍️' :
                                     operationType === 'custom_json' ? '📄' :
                                     operationType === 'feed_publish' ? '📡' :
                                     operationType === 'vote' ? '👍' :
                                     operationType === 'transfer' ? '💰' : '🔧'}
                                  </span>
                                  <div className="operation-meta">
                                    <span className="operation-type">{operationType.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div className="expand-button">
                                  {expandedOperations.has(operationKey) ? <IoChevronUp /> : <IoChevronDown />}
                                </div>
                              </div>

                              <div className="operation-preview">
                                {operationType === 'comment' && (
                                  <span className="operation-summary">
                                    <strong>@{operationData.author}</strong> {operationData.parent_author ? 'commented' : 'posted'}
                                    {operationData.title && <em> "{operationData.title.substring(0, 50)}..."</em>}
                                  </span>
                                )}

                                {operationType === 'custom_json' && (
                                  <span className="operation-summary">
                                    <strong>@{operationData.required_posting_auths?.[0] || 'unknown'}</strong> custom JSON
                                    {operationData.id && <span> ({operationData.id})</span>}
                                  </span>
                                )}

                                {operationType === 'vote' && (
                                  <span className="operation-summary">
                                    <strong>@{operationData.voter}</strong> voted on <strong>@{operationData.author}</strong>
                                    <span className="vote-weight"> {formatVoteWeight(operationData.weight)}</span>
                                  </span>
                                )}

                                {operationType === 'transfer' && (
                                  <span className="operation-summary">
                                    <strong>@{operationData.from}</strong> → <strong>@{operationData.to}</strong>
                                    <span className="transfer-amount"> {operationData.amount}</span>
                                  </span>
                                )}
                              </div>

                              {expandedOperations.has(operationKey) && (
                                <div className="operation-details">
                                  {operationType === 'vote' && (
                                    <>
                                      <div className="detail-item">
                                        <span className="detail-label">Voter:</span>
                                        <span className="detail-value">
                                          <a className="account-link" href={`/accounts/${operationData.voter}`} target="_self">
                                            @{operationData.voter}
                                          </a>
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Author:</span>
                                        <span className="detail-value">
                                          <a className="account-link" href={`/accounts/${operationData.author}`} target="_self">
                                            @{operationData.author}
                                          </a>
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Permlink:</span>
                                        <span className="detail-value">
                                          <a
                                            className="permlink-link"
                                            href={`https://steemit.com/@${operationData.author}/${operationData.permlink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Steemit"
                                          >
                                            {operationData.permlink}
                                          </a>
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Weight:</span>
                                        <span className="detail-value">{formatVoteWeight(operationData.weight)}</span>
                                      </div>
                                    </>
                                  )}

                                  {operationType === 'comment' && (
                                    <>
                                      <div className="detail-item">
                                        <span className="detail-label">Author:</span>
                                        <span className="detail-value">
                                          <a className="account-link" href={`/accounts/${operationData.author}`} target="_self">
                                            @{operationData.author}
                                          </a>
                                        </span>
                                      </div>
                                      {operationData.parent_author && (
                                        <div className="detail-item">
                                          <span className="detail-label">Parent Author:</span>
                                          <span className="detail-value">
                                            <a className="account-link" href={`/accounts/${operationData.parent_author}`} target="_self">
                                              @{operationData.parent_author}
                                            </a>
                                          </span>
                                        </div>
                                      )}
                                      <div className="detail-item">
                                        <span className="detail-label">Permlink:</span>
                                        <span className="detail-value">
                                          <a
                                            className="permlink-link"
                                            href={`https://steemit.com/@${operationData.author}/${operationData.permlink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Steemit"
                                          >
                                            {operationData.permlink}
                                          </a>
                                        </span>
                                      </div>
                                      {operationData.title && (
                                        <div className="detail-item">
                                          <span className="detail-label">Title:</span>
                                          <span className="detail-value">{operationData.title}</span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {operationType === 'transfer' && (
                                    <>
                                      <div className="detail-item">
                                        <span className="detail-label">From:</span>
                                        <span className="detail-value">
                                          <a className="account-link" href={`/accounts/${operationData.from}`} target="_self">
                                            @{operationData.from}
                                          </a>
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">To:</span>
                                        <span className="detail-value">
                                          <a className="account-link" href={`/accounts/${operationData.to}`} target="_self">
                                            @{operationData.to}
                                          </a>
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">{operationData.amount}</span>
                                      </div>
                                      {operationData.memo && (
                                        <div className="detail-item">
                                          <span className="detail-label">Memo:</span>
                                          <span className="detail-value">{operationData.memo}</span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {operationType === 'custom_json' && (
                                    <>
                                      <div className="detail-item">
                                        <span className="detail-label">ID:</span>
                                        <span className="detail-value">{operationData.id}</span>
                                      </div>
                                      {operationData.required_posting_auths && (
                                        <div className="detail-item">
                                          <span className="detail-label">Required Auths:</span>
                                          <span className="detail-value">
                                            {operationData.required_posting_auths.map((auth, index) => (
                                              <span key={index}>
                                                <a className="account-link" href={`/accounts/${auth}`} target="_self">
                                                  @{auth}
                                                </a>
                                                {index < operationData.required_posting_auths.length - 1 && ', '}
                                              </span>
                                            ))}
                                          </span>
                                        </div>
                                      )}
                                      <div className="detail-item">
                                        <span className="detail-label">JSON:</span>
                                        <span className="detail-value">
                                          <pre className="json-preview">{JSON.stringify(JSON.parse(operationData.json), null, 2)}</pre>
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {!['vote', 'comment', 'transfer', 'custom_json'].includes(operationType) && (
                                    <pre className="operation-json">
                                      {JSON.stringify(operationData, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtual Operations Section */}
        {virtualOps.length > 0 && (
          <div className="block-info-card">
            <div className="card-header">
              <h2 className="card-title">Virtual Operations ({virtualOps.length})</h2>
            </div>
            <div className="virtual-ops-list">
              {virtualOps.map((vop, index) => {
                const virtualKey = `virtual-${index}`;
                return (
                  <div key={index} className="virtual-op-card">
                    <div
                      className="virtual-op-header"
                      onClick={() => toggleOperation(virtualKey)}
                    >
                      <div className="virtual-op-summary">
                        <div className="virtual-op-index">#{index + 1}</div>
                        <div className="virtual-op-info">
                          <span className="virtual-op-type">{vop.op?.[0] || 'Unknown'}</span>
                          <span className="virtual-op-timestamp">{formatTimeAgo(vop.timestamp || blockData?.timestamp)}</span>
                        </div>
                      </div>
                      <div className="expand-button">
                        {expandedOperations.has(virtualKey) ? <IoChevronUp /> : <IoChevronDown />}
                      </div>
                    </div>

                    {expandedOperations.has(virtualKey) && (
                      <div className="virtual-op-details">
                        <pre className="operation-json">{JSON.stringify(vop.op?.[1] || {}, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {transactions.length === 0 && virtualOps.length === 0 && (
          <div className="block-info-card">
            <div className="empty-block">
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">Empty Block</h3>
              <p className="empty-message">This block contains no transactions or virtual operations.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockResult;