import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LatestBlocks from './components/LatestBlocks';
import SteemPrice from './components/SteemPrice';
import './styles.css';

const Home = () => {
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="home-page w-full h-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Search Section */}
        <section className="home-search-section">
          <div className="home-search-container">
            <form onSubmit={handleSearch} className="home-search-wrapper">
              <input
                type="text"
                placeholder="Search blocks, transactions, or accounts..."
                className="home-search-input"
                value={searchTerm}
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

        {/* Blockchain Statistics Section */}
        <SteemPrice />

        {/* Recent Blocks Section */}
        <section className="latest-blocks-section">
          <h2 className="section-title">Recent Blocks</h2>
          <div className="table-wrapper">
            <LatestBlocks />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
