import React from 'react';
import { Link } from 'react-router-dom';
import './AccountLink.css';

const AccountLink = ({
  account,
  showAt = true,
  className = '',
  target = '_self',
  children,
  style = {}
}) => {
  if (!account) return null;

  // Clean account name (remove @ if present)
  const cleanAccount = account.replace('@', '');

  return (
    <Link
      to={`/accounts/${cleanAccount}`}
      className={`account-link ${className}`}
      target={target}
      style={style}
    >
      {children || `${showAt ? '@' : ''}${cleanAccount}`}
    </Link>
  );
};

export default AccountLink;