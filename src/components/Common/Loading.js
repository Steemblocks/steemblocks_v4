import React from 'react';
import './Loading.css';

const Loading = ({
  message = "Loading...",
  size = "medium",
  variant = "primary",
  fullScreen = false
}) => {
  const sizeClass = `loading-${size}`;
  const variantClass = `loading-${variant}`;
  const containerClass = fullScreen ? 'loading-fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={`loading-spinner ${sizeClass} ${variantClass}`}>
          <div className="loading-circle loading-circle-1"></div>
          <div className="loading-circle loading-circle-2"></div>
          <div className="loading-circle loading-circle-3"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

// Additional loading variants
export const LoadingDots = ({ message = "Loading..." }) => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-dots">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  </div>
);

export const LoadingBar = ({ progress = null, message = "Loading..." }) => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-bar-container">
        <div className="loading-bar">
          <div
            className="loading-bar-fill"
            style={progress ? { width: `${progress}%` } : {}}
          ></div>
        </div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  </div>
);

export default Loading;