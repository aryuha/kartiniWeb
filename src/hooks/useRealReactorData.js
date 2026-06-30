// src/hooks/useRealReactorData.js
// ============================================================
// Hook untuk MODE ADVANCED: setiap kali kombinasi posisi rod
// berubah, lakukan EXACT MATCH lookup ke database lewat API,
// lalu (kalau ditemukan) catat log operasinya.
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { getRealReactorData, logRealOperation } from '../services/api'

const INITIAL_DATA = {
    power_kw: 0,
    temperature: 25,
    status: 'SHUTDOWN',
}

export const useRealReactorData = (rodPositions, username) => {
    const [reactorData, setReactorData] = useState(INITIAL_DATA)
    const [isFound, setIsFound] = useState(true) // false = kombinasi belum ada di DB
    const [isLoading, setIsLoading] = useState(false)
    const lastLoggedCombo = useRef(null)

    useEffect(() => {
        let active = true
        const { safety, shim, regulating } = rodPositions

        setIsLoading(true)

        getRealReactorData(safety, shim, regulating).then(result => {
            if (!active) return
            setIsLoading(false)

            if (result.found && result.data) {
                setIsFound(true)
                setReactorData({
                    power_kw: result.data.power_kw,
                    temperature: result.data.temperature,
                    status: result.data.status,
                })

                // Catat log operasi — hanya sekali per kombinasi unik
                // (supaya tidak spam insert kalau effect re-run karena alasan lain)
                const comboKey = `${safety}-${shim}-${regulating}`
                if (lastLoggedCombo.current !== comboKey && username) {
                    lastLoggedCombo.current = comboKey
                    logRealOperation({
                        username,
                        safety, shim, regulating,
                        power_kw: result.data.power_kw,
                        temperature: result.data.temperature,
                        status: result.data.status,
                    })
                }
            } else {
                // Kombinasi belum ada datanya di database
                setIsFound(false)
                setReactorData(INITIAL_DATA)
            }
        })

        return () => { active = false }
    }, [rodPositions.safety, rodPositions.shim, rodPositions.regulating, username])

    return { reactorData, isFound, isLoading }
}