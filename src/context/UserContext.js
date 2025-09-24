// UserContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import axios from "axios";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("steemUser");
      const loginTime = localStorage.getItem("steemLoginTime");

      if (savedUser && loginTime) {
        const currentTime = Date.now();
        const loginTimestamp = parseInt(loginTime);
        // Keep login valid for 30 days (30 * 24 * 60 * 60 * 1000 ms)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        if (currentTime - loginTimestamp < thirtyDaysInMs) {
          return JSON.parse(savedUser);
        } else {
          // Login expired, clear storage
          localStorage.removeItem("steemUser");
          localStorage.removeItem("steemLoginTime");
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading saved user:", error);
      // Clear corrupted data
      localStorage.removeItem("steemUser");
      localStorage.removeItem("steemLoginTime");
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check login expiration periodically
  useEffect(() => {
    if (!user) return;

    const checkLoginExpiration = () => {
      const loginTime = localStorage.getItem("steemLoginTime");
      if (loginTime) {
        const currentTime = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        if (currentTime - loginTimestamp > thirtyDaysInMs) {
          logout();
        }
      }
    };

    // Check every hour
    const interval = setInterval(checkLoginExpiration, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Fetch user profile image
  const fetchUserProfile = async (username) => {
    try {
      const response = await axios.get(
        `https://sds0.steemworld.org/accounts_api/getAccount/${username}`,
        { timeout: 5000 }
      );
      return {
        username,
        profileImage: response.data && response.data.profile_image
          ? response.data.profile_image
          : `https://steemitimages.com/u/${username}/avatar/small`,
        displayName: response.data?.display_name || username,
      };
    } catch (error) {
      return {
        username,
        profileImage: `https://steemitimages.com/u/${username}/avatar/small`,
        displayName: username,
      };
    }
  };

  // Login with Steem Keychain
  const loginWithKeychain = async (username) => {
    if (!window.steem_keychain) {
      alert('Steem Keychain extension is not installed. Please install it first.');
      return false;
    }

    setIsLoading(true);

    try {
      // Create a challenge message
      const challenge = `Login to SteemBlocks - ${Date.now()}`;

      return new Promise((resolve) => {
        window.steem_keychain.requestSignBuffer(
          username,
          challenge,
          'Posting',
          (response) => {
            if (response.success) {
              // Fetch user profile and save
              fetchUserProfile(username).then((userProfile) => {
                setUser(userProfile);
                // Save user data and login timestamp
                localStorage.setItem("steemUser", JSON.stringify(userProfile));
                localStorage.setItem("steemLoginTime", Date.now().toString());
                setShowLoginModal(false);
                setIsLoading(false);
                resolve(true);
              });
            } else {
              alert('Login failed: ' + response.message);
              setIsLoading(false);
              resolve(false);
            }
          }
        );
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("steemUser");
    localStorage.removeItem("steemLoginTime");
  };

  // Open login modal
  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  // Close login modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      showLoginModal,
      loginWithKeychain,
      logout,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};