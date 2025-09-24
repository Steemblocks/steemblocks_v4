import React from 'react';
import './styles.css';

const About = () => {
  return (
    <div className="dashboard-container">
      <div className="header-content">
        <h1 className="modern-title">About SteemBlocks</h1>
        <p className="modern-subtitle">Learn more about our mission, vision, and the team behind SteemBlocks</p>
      </div>

      <section className="about-section">
        <h2 className="section-title">Welcome to SteemBlocks</h2>
        <p className="section-text">
          A Steem dapp created by{' '}
          <a
            href="https://steemit.com/@dhaka.witness"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            @Dhaka.witness
          </a>{' '}
          team. We are committed to promoting transparency, decentralization, and community-driven governance on the
          Steem blockchain. As an elected witness, we are honored to serve the Steem community and contribute to the
          advancement of this remarkable platform.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">Basic Information</h2>
        <p className="section-text">
          <a
            href="https://steemit.com/@dhaka.witness"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            @Dhaka.witness
          </a>{' '}
          is a dedicated team of blockchain enthusiasts based in Dhaka, Bangladesh. With a deep understanding of the
          potential of blockchain technology, we have taken on the responsibility of running the following nodes:
        </p>
        <ul className="node-list">
          <li>Witness Node (<a href="https://steemit.com/@dhaka.witness" className="about-link"> @Dhaka.witness</a>)</li>
          <li>Seed Node 1 (seed.dhakawitness.com:2001)</li>
          <li>Seed Node 2 (seed2.dhakawitness.com:2001)</li>
        </ul>

        <h3 className="subsection-title">DApps List:</h3>
        <ul className="dapps-list">
          <li>1. <a href="https://steemblocks.com/" target="_blank" rel="noopener noreferrer" className="about-link">SteemBlocks</a> - Comprehensive Steem blockchain explorer and analytics platform</li>
          <li>2. <a href="https://burn.steemblocks.com/" target="_blank" rel="noopener noreferrer" className="about-link">STEEM Burn Pool</a> - Community-driven STEEM token burning mechanism</li>
          <li>3. <a href="https://discord.com/oauth2/authorize?client_id=1276922336842612777" target="_blank" rel="noopener noreferrer" className="about-link">SteemStats</a> - Multifunctional Discord bot for real-time Steem blockchain statistics</li>
        </ul>

        <h3 className="subsection-title">Other Tools:</h3>
        <ul className="tools-list">
          <li>1. <a href="https://github.com/Steemblocks/Steem-MissedBlocks-Telegram-Bot" target="_blank" rel="noopener noreferrer" className="about-link">Telegram Witness Missed Blocks Alerts</a><br/>
              <span className="tool-description">Telegram bot for monitoring witness missed blocks and sending real-time alerts</span></li>
          <li>2. <a href="https://github.com/Steemblocks/Steem-Local-Broadcast" target="_blank" rel="noopener noreferrer" className="about-link">STEEM Local Broadcasting Tools</a><br/>
              <span className="tool-description">Local tools for broadcasting transactions to the Steem blockchain</span></li>
          <li>3. <a href="https://github.com/Steemblocks/Steem-Local-HTML-Js-Tool" target="_blank" rel="noopener noreferrer" className="about-link">STEEM Local HTML Js Tool</a><br/>
              <span className="tool-description">HTML/JavaScript utilities for local Steem blockchain interactions</span></li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="section-title">Our Objective</h2>
        <p className="section-text">
          Our primary objective is to contribute to the growth and development of the Steem ecosystem through continuous
          innovation and user-centric services. We will gradually update and add new features on our SteemBlocks dapp.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">Our Mission</h2>
        <p className="section-text">
          Our mission at Dhaka.witness is to empower individuals and communities on the Steem blockchain. We envision a
          future where content creators, social media enthusiasts, and online communities thrive in a decentralized and
          transparent ecosystem. Through our witness operations, educational resources, and community engagement, we
          strive to foster an environment that encourages creativity, collaboration, and meaningful interactions.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">Our Vision</h2>
        <p className="section-text">
          We are committed to the core values of transparency, accountability, and open communication. We believe in
          regularly sharing updates, progress reports, and insights about our witness operations, development projects,
          and community initiatives. By embracing transparency, we aim to build trust within the Steem community and
          foster a stronger sense of collaboration and shared purpose.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-text">
          Join us on this exciting journey as we work together to shape the future of Steem. We welcome your
          support, engagement, and feedback. Connect with us on Discord ID:{' '}
          <a href="https://discord.com" className="about-link">
            steemblocks
          </a>
        </p>
      </section>

      <section className="about-section">
        <p className="section-text">
          Together, let us build a decentralized, transparent, and empowering platform that revolutionizes the way we
          create, share, and interact online.
        </p>
      </section>

      <section className="about-section closing-section">
        <p className="section-text">
          Thank you for being part of the Dhaka.witness community! <br /><br />
          <strong>Sincerely,</strong> <br />
          The{' '}
          <a
            href="https://steemit.com/@dhaka.witness"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            Dhaka witness
          </a>{' '}
          Team
        </p>
      </section>
    </div>
  );
};

export default About;
