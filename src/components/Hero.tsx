import React, { useEffect } from 'react';

const Hero: React.FC = () => {
  useEffect(() => {
    // Enhanced hover effects
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
      const handleMouseEnter = () => {
        (button as HTMLElement).style.transform = 'translateY(-3px)';
      };
      
      const handleMouseLeave = () => {
        (button as HTMLElement).style.transform = 'translateY(0)';
      };
      
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, []);

  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <h1>Making bitcoin lending on the Sui platform possible with Ika</h1>
          <p>
            Experience the future of decentralized finance with Ika, the revolutionary MPC solution 
            that makes Bitcoin lending seamless and secure across any blockchain network.
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn-primary">Get to Dashboard</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;