import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState("");

    return (
        <section className="hero-container">
            {/* Ambient Background Visuals */}
            <div className="hero-glow-1"></div>
            <div className="hero-glow-2"></div>
            <div className="hero-grid-overlay"></div>

            <div className="hero-content">
                {/* Community Badge with Fade-in */}
                <div className="hero-badge animate-fade-in">✨ Active Community</div>
                
                {/* Title and Subtitle with clean stagger animations */}
                <h1 className="hero-title animate-slide-up">
                    Build. Share. <span className="text-gradient">Inspire.</span>
                </h1>
                
                <p className="hero-subtitle animate-slide-up-delayed">
                    The ultimate launchpad to showcase your builds, connect with developers, 
                    and put your code on display. Turn ideas into inspiration.
                </p>

                {/* Animated Community Input/Search Box */}
                <div className="hero-search-wrapper animate-slide-up-delayed2">
                    <div className="search-input-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            className="hero-community-input" 
                            placeholder="Search projects, creators, or tech stacks..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                        />
                        <button 
                            className="search-action-btn" 
                            onClick={() => navigate(`/projects?search=${searchVal}`)}
                        >
                            Search
                        </button>
                    </div>
                </div>
                
                {/* Action Controls */}
                <div className="hero-btns animate-slide-up-delayed2">
                    <button 
                        className="hero-btn primary dynamic-glow" 
                        onClick={() => navigate('/showcase')}
                    >
                        My Showcase
                    </button>
                    <button 
                        className="hero-btn secondary" 
                        onClick={() => navigate('/create')}
                    >
                        Share Your Work
                    </button>
                </div>

                {/* Live Community Pulse Metrics
                <div className="hero-stats animate-fade-in-delayed">
                    <div className="stat-item">
                        <span className="pulse-indicator"></span>
                        <p><strong>1,420+</strong> builders online</p>
                    </div>
                    <div className="stat-divider">|</div>
                    <div className="stat-item">
                        <p><strong>4,890+</strong> projects shipped</p>
                    </div>
                </div> */}
            </div>
        </section>
    );
};

export default Hero;