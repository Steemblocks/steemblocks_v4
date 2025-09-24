import React from 'react';
import { Link } from 'react-router-dom';

const BlockLink = ({
  blockNumber,
  showHash = true,
  className = 'block-link',
  style = {}
}) => {
  // Return null or placeholder if no block number
  if (!blockNumber || blockNumber === 0) {
    return <span className="block-placeholder">N/A</span>;
  }

  return (
    <Link
      to={`/blocks/${blockNumber}`}
      className={className}
      style={{
        color: 'inherit',
        textDecoration: 'none',
        ...style
      }}
      title={`View details for block ${blockNumber}`}
    >
      {showHash ? '#' : ''}{blockNumber}
    </Link>
  );
};

export default BlockLink;