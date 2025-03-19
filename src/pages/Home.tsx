import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { HMMIntroduction } from '../components/hmm/HMMIntroduction';
import { HMMTools } from './HMMTools';
import { HMMProblems } from '../components/hmm/HMMProblems';
import { HMMApplications } from '../components/hmm/HMMApplications';
import { VideoSection } from '../components/shared/VideoSection';

export const Home: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="container py-5">
                <HMMIntroduction />
                
                <VideoSection 
                    title="Comprendre les HMM en vidéo"
                    videoId="RWkHJnFj5rY"
                />
                
                <HMMProblems />
                <HMMApplications />
                <HMMTools />
            </main>
        </>
    );
}; 