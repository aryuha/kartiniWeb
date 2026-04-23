// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import HomePage from './components/pages/HomePage';
import PreparePage from './components/pages/PreparePage';
import SimulationPage from './components/pages/SimulationPage';
import './App.css';
import MateriPage from './components/pages/MateriPage';

function App() {
  return (
    <LanguageProvider>
      {/* ProgressProvider di luar Router agar state tidak hancur saat navigate */}
      <ProgressProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/prepare" element={<PreparePage />} />
            <Route path='/materi' element={<MateriPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </LanguageProvider>
  );
}

export default App;
