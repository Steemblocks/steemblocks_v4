import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountLink from '../../components/Common/AccountLink';
import './styles.css';

const TransactionResult = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setError('Transaction ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://api.steemit.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'condenser_api.get_transaction',
            params: [transactionId],
            id: 1,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'Failed to fetch transaction');
        }

        if (!data.result) {
          throw new Error('Transaction not found');
        }

        setTransaction(data.result);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError(err.message || 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const renderOperationDetails = (operation) => {
    const [opType, opData] = operation;

    switch (opType) {
      case 'transfer':
        return (
          <div className="operation-details">
            <div className="detail-item">
              <span className="detail-label">From:</span>
              <span className="detail-value">
                <AccountLink account={opData.from} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">To:</span>
              <span className="detail-value">
                <AccountLink account={opData.to} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">{opData.amount}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Memo:</span>
              <span className="detail-value">{opData.memo || 'No memo'}</span>
            </div>
          </div>
        );
      case 'vote':
        return (
          <div className="operation-details">
            <div className="detail-item">
              <span className="detail-label">Voter:</span>
              <span className="detail-value">
                <AccountLink account={opData.voter} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Author:</span>
              <span className="detail-value">
                <AccountLink account={opData.author} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Permlink:</span>
              <span className="detail-value">{opData.permlink}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Weight:</span>
              <span className="detail-value">{(opData.weight / 100).toFixed(2)}%</span>
            </div>
          </div>
        );
      case 'comment':
        return (
          <div className="operation-details">
            <div className="detail-item">
              <span className="detail-label">Author:</span>
              <span className="detail-value">
                <AccountLink account={opData.author} />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Permlink:</span>
              <span className="detail-value">{opData.permlink}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Parent Author:</span>
              <span className="detail-value">
                {opData.parent_author ? (
                  <AccountLink account={opData.parent_author} />
                ) : (
                  'None (Root post)'
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{opData.title || 'No title'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Body:</span>
              <span className="detail-value">{opData.body && opData.body.length > 100 ? opData.body.substring(0, 100) + '...' : opData.body || 'No content'}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="operation-details">
            <div className="json-data">
              <pre>{JSON.stringify(opData, null, 2)}</pre>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="transaction-result-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading transaction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-result-page">
        <div className="container">
          <div className="error-state">
            <h1>Transaction Not Found</h1>
            <p className="error-message">{error}</p>
            <p className="transaction-id-error">Transaction ID: <code>{transactionId}</code></p>
            <div className="error-note">
              <p>Please check that the transaction ID is correct and try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-result-page">
      <div className="container">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Transaction Details</h1>
          <p className="page-subtitle">Detailed information about Steem blockchain transaction</p>
        </div>

        {/* Search Section */}
        <section className="transaction-search-section">
          <div className="transaction-search-container">
            <form onSubmit={handleSearch} className="transaction-search-wrapper">
              <input
                type="text"
                placeholder="Search blocks, transactions, or accounts..."
                className="transaction-search-input"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <button type="submit" className="transaction-search-button">
                <svg className="transaction-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </section>

        {/* Transaction Information Card */}
        <div className="transaction-card">
          <div className="card-header">
            <h2 className="card-title">Transaction Information</h2>
          </div>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Transaction ID</span>
                <span className="info-value transaction-id">{transaction.transaction_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Block Number</span>
                <span className="info-value">{transaction.block_num ? transaction.block_num : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Transaction Number</span>
                <span className="info-value">{transaction.transaction_num !== undefined ? transaction.transaction_num : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Expiration</span>
                <span className="info-value">{formatDate(transaction.expiration)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Operations</span>
                <span className="info-value">{transaction.operations ? transaction.operations.length : 0} operation(s)</span>
              </div>
              <div className="info-item">
                <span className="info-label">Signatures</span>
                <span className="info-value">{transaction.signatures ? transaction.signatures.length : 0} signature(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operations Section */}
        {transaction.operations && transaction.operations.length > 0 && (
          <div className="operations-section">
            <div className="section-header">
              <h2 className="section-title">Operations</h2>
            </div>
            <div className="operations-list">
              {transaction.operations.map((operation, index) => (
                <div key={index} className="operation-card">
                  <div className="operation-header">
                    <span className="operation-index">#{index + 1}</span>
                    <span className="operation-type">{operation[0]}</span>
                  </div>
                  <div className="operation-content">
                    {renderOperationDetails(operation)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures Section */}
        {transaction.signatures && transaction.signatures.length > 0 && (
          <div className="signatures-section">
            <div className="section-header">
              <h2 className="section-title">Signatures</h2>
            </div>
            <div className="signatures-card">
              <div className="signatures-list">
                {transaction.signatures.map((signature, index) => (
                  <div key={index} className="signature-item">
                    <span className="signature-index">#{index + 1}</span>
                    <span className="signature-value">{signature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionResult;