import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMenuOutline, IoCloseOutline, IoPersonOutline, IoExitOutline } from "react-icons/io5";
import {
  AiFillHome,
  AiOutlineOrderedList,
  AiFillThunderbolt,
} from "react-icons/ai";
import { FaPowerOff } from "react-icons/fa";
import { RiCommunityFill } from "react-icons/ri";
import { GrHistory } from "react-icons/gr";
import { BiSolidUserAccount } from "react-icons/bi";
import { LuSignalHigh } from "react-icons/lu";
import { FcAbout } from "react-icons/fc";
import { useUser } from "../../context/UserContext";
import LogoImage from "../../assets/icons/logo.png";
import LoginModal from "../Auth/LoginModal";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, openLoginModal, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close dropdown when mobile menu is toggled
    setDropdownOpen(false);
  };

  const toggleDropdown = (event) => {
    // Prevent event bubbling
    event.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check both desktop and mobile dropdown refs
      const isDesktopDropdownClick = dropdownRef.current && dropdownRef.current.contains(event.target);
      const isMobileDropdownClick = mobileDropdownRef.current && mobileDropdownRef.current.contains(event.target);

      if (!isDesktopDropdownClick && !isMobileDropdownClick) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/">
            <div className={styles.brandContainer}>
              <img
                src={LogoImage}
                alt="SteemBlocks Logo"
                className={styles.logo}
              />
              <span className={styles.brandText}>
                SteemBlocks
              </span>
            </div>
          </Link>

          {user ? (
            <div className={styles.userProfileDropdown} ref={dropdownRef}>
              <button
                className={styles.profileButton}
                onClick={toggleDropdown}
                title={user.displayName}
              >
                <img
                  src={user.profileImage || '/logo.png'}
                  alt={user.displayName || 'User Avatar'}
                  className={styles.profileImage}
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link
                    to={`/accounts/${user.username}`}
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <IoPersonOutline />
                    <span>Profile</span>
                  </Link>
                  <button
                    className={`${styles.dropdownItem} ${styles.logout}`}
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    <IoExitOutline />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className={styles.loginButton}
              onClick={openLoginModal}
              title="Login with Steem Keychain"
            >
              <IoPersonOutline />
              <span>Login</span>
            </button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <nav className={styles.mobileNav}>
          <div
            className={styles.mobileHeader}
            onClick={(e) => {
              // Prevent mobile menu from toggling when profile dropdown area is clicked
              if (mobileDropdownRef.current && mobileDropdownRef.current.contains(e.target)) {
                e.stopPropagation();
              }
            }}
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <div className={styles.mobileBrand}>
                <img
                  src={LogoImage}
                  alt="SteemBlocks Logo"
                  className={styles.mobileLogo}
                />
                <span className={styles.mobileBrandText}>
                  SteemBlocks
                </span>
              </div>
            </Link>

            <div className={styles.mobileControls}>
              {user ? (
                <div className={styles.mobileUserProfileDropdown} ref={mobileDropdownRef}>
                  <button
                    className={styles.mobileProfileButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleDropdown(e);
                    }}
                    title={user.displayName}
                  >
                    <img
                      src={user.profileImage || '/logo.png'}
                      alt={user.displayName || 'User Avatar'}
                      className={styles.mobileProfileImage}
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className={styles.mobileDropdownMenu}>
                      <Link
                        to={`/accounts/${user.username}`}
                        className={styles.mobileDropdownItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <IoPersonOutline />
                        <span>Profile</span>
                      </Link>
                      <button
                        className={`${styles.mobileDropdownItem} ${styles.logout}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          logout();
                          setDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <IoExitOutline />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={styles.mobileLoginButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    openLoginModal();
                  }}
                  title="Login"
                >
                  <IoPersonOutline />
                </button>
              )}

              <button
                className={styles.mobileMenuBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileMenu();
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className={styles.backdrop}
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Menu Content */}
            <div className={styles.mobileMenu}>
              <div className={styles.menuContent}>
                {/* Close Button Header */}
                <div className={styles.menuHeader}>
                  <span className={styles.menuTitle}>
                    Navigation Menu
                  </span>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <IoCloseOutline />
                  </button>
                </div>

                <nav className={styles.menuNav}>
                  <Link
                    to="/"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AiFillHome className={styles.menuIcon} />
                    <span className={styles.menuText}>Home</span>
                  </Link>
                  <Link
                    to="/power-holders"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AiFillThunderbolt className={styles.menuIcon} />
                    <span className={styles.menuText}>Power Holders</span>
                  </Link>
                  <Link
                    to="/power-down-lists"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaPowerOff className={styles.menuIcon} />
                    <span className={styles.menuText}>Power Downs</span>
                  </Link>
                  <Link
                    to="/new-account"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BiSolidUserAccount className={styles.menuIcon} />
                    <span className={styles.menuText}>New Accounts</span>
                  </Link>
                  <Link
                    to="/account-ranking"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LuSignalHigh className={styles.menuIcon} />
                    <span className={styles.menuText}>Account Ranking</span>
                  </Link>
                  <Link
                    to="/witness-list"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AiOutlineOrderedList className={styles.menuIcon} />
                    <span className={styles.menuText}>Witness List</span>
                  </Link>
                  <Link
                    to="/community-data"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <RiCommunityFill className={styles.menuIcon} />
                    <span className={styles.menuText}>Community Data</span>
                  </Link>
                  <Link
                    to="/content-history"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <GrHistory className={styles.menuIcon} />
                    <span className={styles.menuText}>Content History</span>
                  </Link>
                  <Link
                    to="/about"
                    className={styles.menuLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FcAbout className={styles.menuIcon} />
                    <span className={styles.menuText}>About</span>
                  </Link>
                </nav>
              </div>
            </div>
          </>
        )}
      </nav>

      <LoginModal />
    </>
  );
}
