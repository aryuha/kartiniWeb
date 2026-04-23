// src/context/ProgressContext.jsx
import React, { createContext, useContext, useState } from 'react';

const EMPTY = { step1: false, step2: false, step3: false, step4: false };

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState({ ...EMPTY });

    const completeStep = (stepKey) => {
        setProgress(prev => ({ ...prev, [stepKey]: true }));
    };

    // Hanya reset saat dipanggil eksplisit (klik kembali ke homepage)
    const resetProgress = () => {
        setProgress({ ...EMPTY });
    };

    return (
        <ProgressContext.Provider value={{ progress, completeStep, resetProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const ctx = useContext(ProgressContext);
    if (!ctx) return {
        progress: { ...EMPTY },
        completeStep: () => { },
        resetProgress: () => { },
    };
    return ctx;
};

export default ProgressContext;
