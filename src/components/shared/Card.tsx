import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`card shadow-sm ${className}`}>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}; 