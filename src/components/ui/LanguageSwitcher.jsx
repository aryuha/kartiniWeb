// src/components/ui/LanguageSwitcher.jsx
import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <div style={s.wrap}>
            <button
                style={{
                    ...s.btn,
                    background: language === 'id' ? '#0055aa' : 'transparent',
                    color: language === 'id' ? '#ffffff' : '#0055aa',
                }}
                onClick={() => setLanguage('id')}
            >
                ID
            </button>

            <span style={s.divider}>▼</span>

            <button
                style={{
                    ...s.btn,
                    background: language === 'en' ? '#0055aa' : 'transparent',
                    color: language === 'en' ? '#ffffff' : '#0055aa',
                }}
                onClick={() => setLanguage('en')}
            >
                EN
            </button>
        </div>
    )
}

const s = {
    wrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#ffffff',
        border: '1px solid #c0d0e0',
        borderRadius: 6,
        padding: '3px 6px',
    },
    btn: {
        border: 'none',
        borderRadius: 4,
        padding: '3px 8px',
        cursor: 'pointer',
        fontFamily: "'Orbitron',monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        transition: 'all 0.2s',
    },
    divider: {
        fontSize: 8,
        color: '#7799bb',
    }
}

// ← Hanya SATU export default di sini
export default LanguageSwitcher