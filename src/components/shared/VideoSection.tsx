import React from 'react';

interface VideoSectionProps {
    title: string;
    videoId: string;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ title, videoId }) => {
    return (
        <section className="mb-5">
            <h2>{title}</h2>
            <div className="ratio ratio-16x9">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </section>
    );
}; 