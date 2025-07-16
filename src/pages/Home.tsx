import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Platform from '../components/Platform';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="Home">
      <Header />
      <main>
        <Hero />
        <Platform />
      </main>
      <Footer />
    </div>
  );
};

export default Home;