import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <div className="logo-icon">$</div>
              <span>btclend</span>
            </div>
            <p className="footer-description">
              Making Bitcoin accessible anywhere through Ika's innovative MPC technology. 
              Experience seamless lending across multiple blockchain networks.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon">₿</a>
              <a href="#" className="social-icon">©</a>
              <a href="#" className="social-icon">𝕏</a>
              <a href="#" className="social-icon">@</a>
              <a href="#" className="social-icon">🔗</a>
              <a href="#" className="social-icon">🎮</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Platform</h3>
            <ul>
              <li><a href="#">Lending Pools</a></li>
              <li><a href="#">Staking Rewards</a></li>
              <li><a href="#">Portfolio</a></li>
              <li><a href="#">Analytics</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
          <p>&copy; 2024 btclend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;