// src/context/ProgressContext.jsx
import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'glowlab-progress';
const EMPTY = { step1: false, step2: false, step3: false, step4: false };

// Baca progress dari localStorage saat pertama kali load
function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validasi: pastikan semua key ada
            return {
                step1: Boolean(parsed.step1),
                step2: Boolean(parsed.step2),
                step3: Boolean(parsed.step3),
                step4: Boolean(parsed.step4),
            };
        }
    } catch (e) {
        console.warn('[ProgressContext] Gagal baca localStorage:', e);
    }
    return { ...EMPTY };
}

// Simpan progress ke localStorage
function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn('[ProgressContext] Gagal simpan localStorage:', e);
    }
}

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
    // Inisialisasi dari localStorage, bukan dari EMPTY
    const [progress, setProgress] = useState(() => loadProgress());

    const completeStep = (stepKey) => {
        setProgress(prev => {
            const next = { ...prev, [stepKey]: true };
            saveProgress(next); // Simpan ke localStorage setiap ada perubahan
            return next;
        });
    };

    // Reset: hapus localStorage DAN reset state
    const resetProgress = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('[ProgressContext] Gagal hapus localStorage:', e);
        }
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