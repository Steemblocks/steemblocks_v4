import React, { useState, useEffect } from "react";
import axios from "axios";
import AccountLink from "../../components/Common/AccountLink";
import Loading from "../../components/Common/Loading";
import './styles.css';

const PowerHolders = () => {
  const [powerHolderData, setPowerHolderData] = useState([]);
  const [profileImages, setProfileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Force 15 items like PowerDownLists

  const fetchProfileImages = React.useCallback(async (accounts) => {
    if (!accounts || accounts.length === 0) return;

    // Use Steemit avatar URLs directly to avoid CORS issues during development
    const newImages = {};
    accounts.forEach((account) => {
      newImages[account.account] = `https://steemitimages.com/u/${account.account}/avatar/small`;
    });

    if (Object.keys(newImages).length > 0) {
      setProfileImages(prev => ({ ...prev, ...newImages }));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://steemdata.justyy.workers.dev/?data=ranking&by=sp",
          { timeout: 10000 }
        );
        if (response.data && Array.isArray(response.data.data)) {
          setPowerHolderData(response.data.data);
        } else {
          console.error(
            "Invalid or unexpected data format in API response:",
            response.data
          );
          setPowerHolderData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPowerHolderData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initial profile image fetch when data loads
  useEffect(() => {
    if (powerHolderData.length > 0 && Object.keys(profileImages).length === 0) {
      const initialItems = powerHolderData.slice(0, itemsPerPage);
      fetchProfileImages(initialItems);
    }
  }, [powerHolderData, profileImages, fetchProfileImages, itemsPerPage]);

  // Fetch profile images when page changes
  useEffect(() => {
    if (powerHolderData.length > 0) {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = powerHolderData.slice(indexOfFirstItem, indexOfLastItem);

      const accountsNeedingImages = currentItems.filter(
        account => !profileImages[account.account]
      );

      if (accountsNeedingImages.length > 0) {
        fetchProfileImages(accountsNeedingImages);
      }
    }
  }, [currentPage, powerHolderData, profileImages, fetchProfileImages, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = powerHolderData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(powerHolderData.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const formatNumber = (value) => {
    const num = parseFloat(value) || 0;

    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else if (num >= 1) {
      return num.toFixed(2);
    } else {
      return num.toFixed(2);
    }
  };

  // Original orange/gold ranking system - same as PowerDownLists
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'rank-badge-first';
    if (rank === 2) return 'rank-badge-second';
    if (rank === 3) return 'rank-badge-third';
    if (rank <= 10) return 'rank-badge-silver';
    if (rank <= 50) return 'rank-badge-bronze';
    return 'rank-badge-default';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Loading
          message="Loading Power Holders Data..."
          size="medium"
          variant="primary"
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="header-content">
        <h1 className="modern-title">Power Holders Rankings</h1>
        <p className="modern-subtitle">
          Top Steem accounts ranked by Steem Power holdings
        </p>
      </div>

      {/* Main Power Holders Table */}
      <div className="headers-reference-card">
        <div className="table-scroll-container">
          <table className="headers-reference-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Account</th>
                <th>SP</th>
                <th>Own Votes</th>
                <th>Proxy Votes</th>
                <th>STEEM</th>
                <th>SBD</th>
                <th>Del In</th>
                <th>Del Out</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((data, index) => (
                <tr key={`holder-${index}`} className="reference-row">
                  <td className="ref-rank">
                    <div className={`rank-badge ${getRankBadgeColor(data.rank)}`}>
                      #{data.rank}
                    </div>
                  </td>
                  <td className="ref-account">
                    <div className="ref-account-info">
                      <img
                        src={profileImages[data.account] || `https://steemitimages.com/u/${data.account}/avatar/small`}
                        alt={`${data.account} profile`}
                        className="ref-profile-avatar"
                        onError={(e) => {
                          e.target.src = `https://steemitimages.com/u/${data.account}/avatar/small`;
                        }}
                      />
                      <div className="ref-account-details">
                        <AccountLink
                          account={data.account}
                          className="ref-account-link"
                        />
                        <span className={`ref-account-rep ${parseFloat(data.rep || '25') < 0 ? 'negative-rep' : ''}`}>
                          ({parseFloat(data.rep || '25').toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="ref-steempower">{formatNumber(data.sp || 0)} SP</td>
                  <td className="ref-votes">{formatNumber(data.own_vote || 0)}</td>
                  <td className="ref-votes">{formatNumber(data.other_vote || 0)}</td>
                  <td className="ref-steem">{formatNumber(data.steem || 0)}</td>
                  <td className="ref-sbd">{formatNumber(data.sbd || 0)}</td>
                  <td className="ref-delegation">{formatNumber(data.sp_plus || 0)}</td>
                  <td className="ref-delegation">{formatNumber(data.sp_minus || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <span className="pagination-text">
            Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, powerHolderData.length)}</strong> of <strong>{powerHolderData.length}</strong> accounts
          </span>
        </div>
        <div className="pagination-controls">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
            title="Previous page"
          >
            <span className="btn-icon">←</span>
            <span className="btn-text">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="page-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => goToPage(1)}
                  className="page-number"
                >
                  1
                </button>
                {currentPage > 4 && <span className="pagination-dots">...</span>}
              </>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  title={`Go to page ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                {currentPage < totalPages - 3 && <span className="pagination-dots">...</span>}
                <button
                  onClick={() => goToPage(totalPages)}
                  className="page-number"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="pagination-btn next-btn"
            title="Next page"
          >
            <span className="btn-text">Next</span>
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerHolders;
