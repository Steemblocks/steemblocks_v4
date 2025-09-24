import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { IoClose, IoKeyOutline, IoWarningOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import styles from './LoginModal.module.css';

const LoginModal = () => {
  const { showLoginModal, closeLoginModal, loginWithKeychain, isLoading } = useUser();
  const [username, setUsername] = useState('');
  const [isKeychainInstalled, setIsKeychainInstalled] = useState(false);

  // Check if Steem Keychain is installed
  useEffect(() => {
    const checkKeychainInstallation = () => {
      // Check if window.steem_keychain exists
      const isInstalled = typeof window !== 'undefined' && window.steem_keychain;
      setIsKeychainInstalled(isInstalled);
    };

    // Initial check
    checkKeychainInstallation();

    // Recheck after a short delay to allow for extension loading
    const timer = setTimeout(checkKeychainInstallation, 1000);

    return () => clearTimeout(timer);
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter your Steem username');
      return;
    }
    if (!isKeychainInstalled) {
      alert('Please install Steem Keychain browser extension first');
      return;
    }
    await loginWithKeychain(username.trim());
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeLoginModal();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Login to SteemBlocks</h2>
          <button
            className={styles.closeButton}
            onClick={closeLoginModal}
            aria-label="Close modal"
          >
            <IoClose />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <IoShieldCheckmarkOutline className={styles.loginIcon} />
          </div>

          <p className={styles.description}>
            Connect with your Steem account using Keychain
          </p>

          <div className={styles.notice}>
            <small>
              ⚠️ This dApp only supports <strong>STEEM Keychain</strong>.
              MetaMask and other Ethereum wallets are not compatible.
            </small>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter your Steem username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading || !username.trim() || !isKeychainInstalled}
            >
              <IoKeyOutline className={styles.buttonIcon} />
              {isLoading ? 'Connecting...' : 'Login with Keychain'}
            </button>
          </form>

          {!isKeychainInstalled && (
            <div className={styles.warningNote}>
              <div className={styles.warningHeader}>
                <IoWarningOutline className={styles.warningIcon} />
                <span>Keychain Extension Required</span>
              </div>
              <p className={styles.warningText}>
                Please install the Steem Keychain browser extension.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/steemkeychain/jhgnbkkipaallpehbohjmkbjofjdmeid"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.installButton}
              >
                Install Steem Keychain
              </a>
            </div>
          )}

          {isKeychainInstalled && (
            <div className={styles.successNote}>
              <p className={styles.successText}>
                ✅ Steem Keychain detected! Login securely!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;