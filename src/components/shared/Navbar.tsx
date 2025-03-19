import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavItem {
    title: string;
    path: string;
    icon: string;
}

const navItems: NavItem[] = [
    {
        title: 'Accueil',
        path: '/',
        icon: 'fas fa-home'
    },
    {
        title: 'Outils HMM',
        path: '/hmm-tools',
        icon: 'fas fa-tools'
    },
    {
        title: 'Conversion ADN',
        path: '/conversion-adn',
        icon: 'fas fa-dna'
    },
    {
        title: 'Documentation',
        path: '/documentation',
        icon: 'fas fa-book'
    }
];

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <i className="fas fa-project-diagram me-2"></i>
                    UMDHMM
                </Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {navItems.map((item, index) => (
                            <li className="nav-item" key={index}>
                                <Link 
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    to={item.path}
                                >
                                    <i className={`${item.icon} me-2`}></i>
                                    {item.title}
                                    {location.pathname === item.path && (
                                        <div className="nav-indicator"></div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}; 