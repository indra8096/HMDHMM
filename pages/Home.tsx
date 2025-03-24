import React from 'react';
import { Navbar } from '../src/components/shared/Navbar';
import { HMMIntroduction } from '../src/components/hmm/HMMIntroduction';
import { HMMTools } from '../src/components/shared/HMMTools';
import { HMMProblems } from '../src/components/hmm/HMMProblems';
import { HMMApplications } from '../src/components/hmm/HMMApplications';
import { VideoSection } from '../src/components/shared/VideoSection';

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