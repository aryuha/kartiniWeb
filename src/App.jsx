// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import HomePage from './components/pages/HomePage';
import './App.css';

const PreparePage = lazy(() => import('./components/pages/PreparePage'));
const SimulationPage = lazy(() => import('./components/pages/SimulationPage'));
const IRLModePage = lazy(() => import('./components/pages/IRLModePage'));
const SkorPage = lazy(() => import('./components/pages/SkorPage'));
const MateriPage = lazy(() => import('./components/pages/MateriPage'));

const PageShell = () => <div style={{ width: '100%', height: '100vh', background: '#060d1a' }} />

function App() {
  return (
    <LanguageProvider>
      <ProgressProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<PageShell />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/prepare" element={<PreparePage />} />
              <Route path='/materi' element={<MateriPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/irl-mode" element={<IRLModePage />} />
              <Route path="/skor" element={<SkorPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ProgressProvider>
    </LanguageProvider>
  );
}

export default App;