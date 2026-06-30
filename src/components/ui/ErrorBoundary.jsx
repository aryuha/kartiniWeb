import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error) {
        console.error('[Three.js Error]', error)
    }

    render() {
        if (this.state.hasError) {
            const { errTitle, errSubtitle } = this.props
            return (
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', height: '100%',
                    flexDirection: 'column', gap: 12,
                    background: '#0a1628', color: '#7799bb',
                }}>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 11, letterSpacing: 2,
                    }}>
                        {errTitle}
                    </div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: 8, color: '#4466aa',
                    }}>
                        {errSubtitle}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

function ErrorBoundary({ children }) {
    const { t } = useLanguage()
    return (
        <ErrorBoundaryClass errTitle={t('errTitle')} errSubtitle={t('errSubtitle')}>
            {children}
        </ErrorBoundaryClass>
    )
}

export default ErrorBoundary
