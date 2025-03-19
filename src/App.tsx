import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HMMTools } from './pages/HMMTools';
import { DNAConversion } from './pages/DNAConversion';
import { Documentation } from './pages/Documentation';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hmm-tools" element={<HMMTools />} />
          <Route path="/conversion-adn" element={<DNAConversion />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App; 