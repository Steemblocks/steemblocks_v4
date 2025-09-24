import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Routes from "./Routes/Routes";

// Enhanced MetaMask error suppression for STEEM-only application
if (typeof window !== 'undefined') {
  // Suppress MetaMask-related errors more comprehensively
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('MetaMask') ||
        message.includes('Failed to connect to MetaMask') ||
        message.includes('inpage.js') ||
        message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')) {
      return; // Suppress MetaMask-related errors
    }
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections from MetaMask
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message &&
        (event.reason.message.includes('MetaMask') ||
         event.reason.message.includes('inpage.js'))) {
      event.preventDefault(); // Prevent the error from propagating
    }
  });

  // If ethereum object exists, disable MetaMask auto-connection
  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      window.ethereum._metamask = { isUnlocked: () => Promise.resolve(false) };
    } catch (e) {
      // Silently ignore if we can't modify MetaMask
    }
  }
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: Routes
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
