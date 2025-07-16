import React, { useEffect } from 'react';

const Platform: React.FC = () => {
  useEffect(() => {
    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const elements = document.querySelectorAll('.platform-content, .stat-item');
    elements.forEach(el => {
      observer.observe(el);
    });

    return () => {
      elements.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="platform" id="platform">
      <div className="container">
        <div className="platform-content">
          <h2>What you say about the platform!</h2>
          <p>
            Share your thoughts and experience with our revolutionary Bitcoin lending platform 
            powered by Ika technology.
          </p>
          
          <div className="platform-preview">
            <div className="platform-mockup">
              <div className="mockup-header">
                <div className="mockup-logo">
                  <div className="logo-icon">$</div>
                  btclend
                </div>
                <div style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500}}>
                  Announcements
                </div>
              </div>
              <div className="mockup-stats">
                <div className="stat-item">
                  <div className="stat-value">$1,098</div>
                  <div className="stat-label">Total Value</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">+15.33%</div>
                  <div className="stat-label">Today APY</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">$388</div>
                  <div className="stat-label">Earnings</div>
                </div>
              </div>
              <div className="chart-item">
                Portfolio Performance Analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;