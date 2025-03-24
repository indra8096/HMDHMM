import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
    const router = useRouter();
    
    const isActive = (path: string) => {
        return router.pathname === path ? 'active' : '';
    };
    
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link href="/" className="navbar-brand">
                    UMDHMM
                </Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link href="/" className={`nav-link ${isActive('/')}`}>
                                Accueil
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/hmm-tools" className={`nav-link ${isActive('/hmm-tools')}`}>
                                Outils HMM
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/dna-conversion" className={`nav-link ${isActive('/dna-conversion')}`}>
                                Conversion ADN
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/documentation" className={`nav-link ${isActive('/documentation')}`}>
                                Documentation
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
} 