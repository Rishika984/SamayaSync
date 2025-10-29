import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="title-hindi">समय</span><span className="title-english">SYNC</span>
            </h3>
            <p className="footer-description">
              Track your study time, build habits, and achieve your goals.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <ul className="footer-links">
              <li><a href="#github">GitHub</a></li>
              <li><a href="#linkedin">LinkedIn</a></li>
              <li><a href="#email">Email</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2025 SamayaSync. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;