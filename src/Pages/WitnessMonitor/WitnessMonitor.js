import React, { useState, useEffect } from "react";
import {
  FaTools,
  FaCode,
  FaServer,
  FaGithub,
  FaRocket,
  FaChartLine,
  FaEye,
  FaCogs,
  FaBullhorn
} from "react-icons/fa";
import Loading from '../../components/Common/Loading';
import "./styles.css";

const WitnessMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
      setAnimationClass("fade-in");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const upcomingFeatures = [
    {
      icon: <FaChartLine className="feature-icon" />,
      title: "Witness Performance Analytics",
      description: "Real-time monitoring of block production, missed blocks, and reliability metrics"
    },
    {
      icon: <FaCode className="feature-icon" />,
      title: "Development Activity Tracker",
      description: "Track GitHub contributions, commits, and project development progress"
    },
    {
      icon: <FaServer className="feature-icon" />,
      title: "Infrastructure Monitoring",
      description: "Monitor witness node status, version updates, and technical specifications"
    },
    {
      icon: <FaRocket className="feature-icon" />,
      title: "Project Portfolio",
      description: "Comprehensive list of witness projects, applications, and contributions to Steem ecosystem"
    },
    {
      icon: <FaEye className="feature-icon" />,
      title: "Activity Timeline",
      description: "Historical view of witness activities, updates, and community engagement"
    },
    {
      icon: <FaBullhorn className="feature-icon" />,
      title: "Announcement Feed",
      description: "Latest announcements, updates, and communications from witnesses"
    }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`witness-monitor-container ${animationClass}`}>
      {/* Header Section */}
      <div className="witness-monitor-header">
        <div className="header-content">
          <h1 className="modern-title">
            <FaCogs className="title-icon" />
            Witness Monitor
          </h1>
          <p className="modern-subtitle">
            Comprehensive witness activity and development progress tracking system
          </p>
        </div>

        {/* Status Badge */}
        <div className="status-badge construction">
          <FaTools className="status-icon" />
          <span>Under Construction</span>
        </div>
      </div>

      {/* Construction Notice */}
      <div className="construction-notice">
        <div className="notice-content">
          <div className="notice-icon-wrapper">
            <FaTools className="construction-icon" />
          </div>
          <div className="notice-text">
            <h2>Coming Soon</h2>
            <p>
              We're building an advanced witness monitoring system that will provide
              comprehensive insights into witness activities, development progress,
              and contributions to the Steem ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="features-preview">
        <div className="features-header">
          <h2 className="features-title">Upcoming Features</h2>
          <p className="features-subtitle">
            Powerful tools for monitoring and analyzing witness performance
          </p>
        </div>

        <div className="features-grid">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
              <div className="feature-status">
                <span className="status-dot"></span>
                <span className="status-text">In Development</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Specifications Preview */}
      <div className="tech-specs-preview">
        <div className="specs-header">
          <h2 className="specs-title">
            <FaServer className="specs-icon" />
            Technical Specifications
          </h2>
          <p className="specs-subtitle">
            Advanced monitoring capabilities being developed
          </p>
        </div>

        <div className="specs-grid">
          <div className="spec-item">
            <div className="spec-label">Data Sources</div>
            <div className="spec-value">Steem APIs, GitHub, Node Status</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Update Frequency</div>
            <div className="spec-value">Real-time & Scheduled</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Metrics Tracked</div>
            <div className="spec-value">50+ Performance Indicators</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Historical Data</div>
            <div className="spec-value">Up to 12 months</div>
          </div>
        </div>
      </div>

      {/* Developer Note */}
      <div className="developer-note">
        <div className="note-content">
          <FaGithub className="github-icon" />
          <div className="note-text">
            <h3>For Developers</h3>
            <p>
              This monitoring system will integrate with multiple APIs and data sources
              to provide accurate, real-time witness information. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WitnessMonitor;