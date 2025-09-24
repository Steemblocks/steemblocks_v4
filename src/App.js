// App.js
import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Navbar/Sidebar";
import { UserProvider } from "./context/UserContext";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  useEffect(() => {
    // Final layer of MetaMask error suppression at App level
    const handleError = (event) => {
      if (event.error && event.error.message &&
          (event.error.message.includes('MetaMask') ||
           event.error.message.includes('Failed to connect to MetaMask') ||
           event.error.message.includes('inpage.js'))) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

const AppContent = () => {
  return (
    <>
      <Navbar />
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            © 2023 @Dhaka.witness. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
};

export default App;
