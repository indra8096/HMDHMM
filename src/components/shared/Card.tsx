import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`card shadow-sm ${className}`}>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
} 