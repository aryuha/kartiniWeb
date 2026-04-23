// ============================================
// API SERVICE - Komunikasi dengan FastAPI
// ============================================

import axios from 'axios'

const BASE_URL = '/api'

// Axios instance dengan konfigurasi default
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        return config
    },
    (error) => Promise.reect(error)
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('[API Error]', error.message)
        return Promise.reject(error)
    }
)

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Kirim posisi batang kendali ke FastAPI
 * @param {Object} rodPositions - { safety: number, shim: number, regulating: number }
 * @returns {Promise<Object>} - Response dari server
 */
export const sendRodPositions = async (rodPositions) => {
    try {
        const response = await apiClient.post('/reactor/calculate', {
            safety_rod: rodPositions.safety,
            shim_rod: rodPositions.shim,
            regulating_rod: rodPositions.regulating,
            timestamp: new Date().toISOString(),
        })
        return response
    } catch (error) {
        // Jika API tidak tersedia, return mock data untuk development
        console.warn('[API] FastAPI tidak tersedia, menggunakan mock data:', error.message)
        return mockCalculatePower(rodPositions)
    }
}

/**
 * SCRAM - Emergency stop
 * @returns {Promise<Object>}
 */
export const scramReactor = async () => {
    try {
        const response = await apiClient.post('/reactor/scram', {
            timestamp: new Date().toISOString(),
        })
        return response
    } catch (error) {
        console.warn('[API] SCRAM - FastAPI tidak tersedia:', error.message)
        return { status: 'SCRAM', power: 0, message: 'Reactor scrammed successfully' }
    }
}

/**
 * Get reactor status
 * @returns {Promise<Object>}
 */
export const getReactorStatus = async () => {
    try {
        const response = await apiClient.get('/reactor/status')
        return response
    } catch (error) {
        console.warn('[API] Status check gagal:', error.message)
        return { status: 'offline', power: 0 }
    }
}

// ============================================
// MOCK DATA (untuk development tanpa FastAPI)
// ============================================

const mockCalculatePower = (rodPositions) => {
    const { safety, shim, regulating } = rodPositions

    // Simulasi perhitungan daya sederhana
    // Reaktor hanya beroperasi jika safety rod > 50%
    if (safety < 50) {
        return {
            power: 0,
            power_kw: 0,
            reactivity: -999,
            period: null,
            status: 'SHUTDOWN',
            neutron_flux: 0,
            temperature: 25,
            rod_positions: rodPositions,
            sram_triggered: false,
        }
    }

    // Hitung reaktivitas berdasarkan posisi batang kendali
    const safetyContribution = ((safety - 50) / 50) * 0.4   // 0 - 0.4
    const shimContribution = (shim / 100) * 0.35          // 0 - 0.35
    const regulatingContrib = (regulating / 100) * 0.1     // 0 - 0.1

    const totalReactivity = safetyContribution + shimContribution + regulatingContrib - 0.5

    // Daya berbasis reaktivitas
    let power = 0
    if (totalReactivity > 0) {
        power = Math.min(100, totalReactivity * 200 + Math.random() * 2)
    } else if (totalReactivity === 0) {
        power = 50 + Math.random() * 2 - 1 // Critical
    }
    const MAX_KW = 120
    const power_kw = (power / 100) * MAX_KW // Max 120 kW untuk Kartini

    // ← BARU: Cek SCRAM threshold
    const scram_triggered = power_kw >= 110

    return {
        power: parseFloat(power.toFixed(2)),
        power_kw: parseFloat(power_kw.toFixed(2)),
        reactivity: parseFloat((totalReactivity * 100).toFixed(3)),
        period: totalReactivity > 0
            ? parseFloat((1 / totalReactivity).toFixed(1))
            : null,
        status: power > 0 ? 'OPERATING' : 'SUBCRITICAL',
        neutron_flux: parseFloat((power * 1e12).toExponential(2)),
        temperature: parseFloat((25 + power * 0.5).toFixed(1)),
        rod_positions: rodPositions,
        scram_triggered, // ← BARU
    }
}