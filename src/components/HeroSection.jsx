import React from 'react';
import { Link } from 'react-router-dom';
import sideimg from './Images/sideimg.png';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="title-hindi">समय</span>SYNC!
          </h1>
          <p className="hero-description">
            <span className="desc-hindi">समय</span>SYNC helps you track your study time, 
            build consistent habits, and measure your progress.
          </p>
          <Link to="/signup">
            <button className="cta-button">Get Started!</button>
          </Link>
        </div>
        <div className="hero-image">
          <img
            src={sideimg}
            alt="Study materials with clock"
            className="image"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;