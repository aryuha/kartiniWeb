// src/hooks/useKeyboardControl.js
import { useEffect, useCallback, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const KEY_MAPPING = {
    KeyQ: { rod: 'safety', direction: 'up' },
    KeyA: { rod: 'safety', direction: 'down' },
    KeyW: { rod: 'shim', direction: 'up' },
    KeyS: { rod: 'shim', direction: 'down' },
    KeyE: { rod: 'regulating', direction: 'up' },
    KeyD: { rod: 'regulating', direction: 'down' },
};

const SCRAM_KEY_MAPPING = {
    KeyR: 'safety',
    KeyT: 'shim',
    KeyY: 'regulating',
};

const HOLD_INTERVAL_MS = 80;

const codeToActiveKey = {
    KeyQ: 'safetyUp',
    KeyA: 'safetyDown',
    KeyW: 'shimUp',
    KeyS: 'shimDown',
    KeyE: 'regUp',
    KeyD: 'regDown',
    KeyR: 'scramSafety',
    KeyT: 'scramShim',
    KeyY: 'scramReg',
};

export const useKeyboardControl = (
    moveRod,
    isScrammed,
    scramRod,
    scrammedRods,
    disabled = false,
    resetScramRod = null,
) => {
    const { t } = useLanguage();
    const [shiftPressed, setShiftPressed] = useState(false);
    const [lastAction, setLastAction] = useState(null);
    const [activeKeys, setActiveKeys] = useState({
        safetyUp: false, safetyDown: false,
        shimUp: false, shimDown: false,
        regUp: false, regDown: false,
        scramSafety: false, scramShim: false, scramReg: false,
    });

    const holdIntervals = useRef({});
    const pressedKeys = useRef(new Set());

    const executeMove = useCallback((mapping, isShift) => {
        if (disabled) return false;
        if (!isShift) {
            setLastAction({ type: 'blocked', message: t('shiftRequired') });
            return false;
        }
        if (isScrammed) {
            setLastAction({ type: 'scram', message: t('scramRequired') });
            return false;
        }
        if (scrammedRods && scrammedRods[mapping.rod]) {
            setLastAction({
                type: 'scram',
                message: `⚠ ${mapping.rod.toUpperCase()} ROD dalam kondisi SCRAM.`,
            });
            return false;
        }
        moveRod(mapping.rod, mapping.direction);
        setLastAction({
            type: 'success',
            message: `✓ ${mapping.rod.toUpperCase()} → ${mapping.direction === 'up' ?
                t('naikSign') : t('turunSign')}`,
        });
        return true;
    }, [moveRod, isScrammed, scrammedRods, disabled, t]);

    const handleKeyDown = useCallback((event) => {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            setShiftPressed(true);
            return;
        }

        // KUNCI UTAMA: Jika disabled (power off atau belum ada nickname),
        // blokir SEMUA input termasuk SCRAM
        if (disabled) {
            return;
        }

        // SCRAM Keys (R, T, Y) — toggle: SCRAM jika aktif, RESET jika sudah discrammed
        const scramRodType = SCRAM_KEY_MAPPING[event.code];
        if (scramRodType && !event.shiftKey) {
            event.preventDefault();
            const activeKeyName = codeToActiveKey[event.code];
            if (activeKeyName) {
                setActiveKeys(prev => ({ ...prev, [activeKeyName]: true }));
            }
            if (scrammedRods?.[scramRodType]) {
                // Sudah SCRAM → reset dengan menekan tombol yang sama
                if (resetScramRod) {
                    resetScramRod(scramRodType);
                    setLastAction({ type: 'success', message: `↺ RESET SCRAM ${scramRodType.toUpperCase()}` });
                }
            } else if (scramRod) {
                scramRod(scramRodType);
                setLastAction({ type: 'scram', message: `⚡ SCRAM ${scramRodType.toUpperCase()} AKTIF` });
            }
            return;
        }

        // Movement Keys (Q,A,W,S,E,D) - dengan Shift
        const mapping = KEY_MAPPING[event.code];
        if (!mapping) return;

        event.preventDefault();
        if (pressedKeys.current.has(event.code)) return;
        pressedKeys.current.add(event.code);

        const activeKeyName = codeToActiveKey[event.code];
        if (activeKeyName) {
            setActiveKeys(prev => ({ ...prev, [activeKeyName]: true }));
        }

        const success = executeMove(mapping, event.shiftKey);
        if (!success) {
            pressedKeys.current.delete(event.code);
            if (activeKeyName) {
                setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }));
            }
            return;
        }

        holdIntervals.current[event.code] = setInterval(() => {
            executeMove(mapping, true);
        }, HOLD_INTERVAL_MS);
    }, [executeMove, scramRod, scrammedRods, resetScramRod, disabled]);

    const handleKeyUp = useCallback((event) => {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            setShiftPressed(false);
        }

        Object.keys(holdIntervals.current).forEach(code => {
            if (holdIntervals.current[code]) {
                clearInterval(holdIntervals.current[code]);
                holdIntervals.current[code] = null;
            }
        });
        pressedKeys.current.clear();

        setActiveKeys(prev => ({
            ...prev,
            safetyUp: false, safetyDown: false,
            shimUp: false, shimDown: false,
            regUp: false, regDown: false,
        }));

        const activeKeyName = codeToActiveKey[event.code];
        if (activeKeyName) {
            setActiveKeys(prev => ({ ...prev, [activeKeyName]: false }));
        }

    }, []);

    // Reset activeKeys saat disabled berubah jadi true
    useEffect(() => {
        if (disabled) {
            // Bersihkan semua interval yang aktif
            Object.keys(holdIntervals.current).forEach(code => {
                if (holdIntervals.current[code]) {
                    clearInterval(holdIntervals.current[code]);
                    holdIntervals.current[code] = null;
                }
            });
            pressedKeys.current.clear();
            // Reset semua visual key
            setActiveKeys({
                safetyUp: false, safetyDown: false,
                shimUp: false, shimDown: false,
                regUp: false, regDown: false,
                scramSafety: false, scramShim: false, scramReg: false,
            });
        }
    }, [disabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            Object.keys(holdIntervals.current).forEach(code => {
                if (holdIntervals.current[code]) clearInterval(holdIntervals.current[code]);
            });
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        if (lastAction) {
            const timer = setTimeout(() => setLastAction(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [lastAction]);

    return { shiftPressed, lastAction, activeKeys, keyMapping: KEY_MAPPING };
};