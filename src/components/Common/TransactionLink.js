import React from 'react';
import { Link } from 'react-router-dom';
import './TransactionLink.css';

const TransactionLink = ({
  transactionId,
  showHash = true,
  className = 'transaction-link',
  style = {},
  truncate = true,
  maxLength = 12
}) => {
  // Return null or placeholder if no transaction ID
  if (!transactionId) {
    return <span className="transaction-placeholder">N/A</span>;
  }

  // Clean transaction ID (remove any prefixes if present)
  const cleanTransactionId = String(transactionId).trim();

  // Truncate long transaction IDs for display
  const displayText = truncate && cleanTransactionId.length > maxLength
    ? `${cleanTransactionId.substring(0, maxLength)}...`
    : cleanTransactionId;

  return (
    <Link
      to={`/transactions/${cleanTransactionId}`}
      className={className}
      style={{
        color: 'inherit',
        textDecoration: 'none',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        ...style
      }}
      title={`View details for transaction ${cleanTransactionId}`}
    >
      {showHash ? '#' : ''}{displayText}
    </Link>
  );
};

export default TransactionLink;