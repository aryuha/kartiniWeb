# ============================================
# FASTAPI BACKEND - Reaktor Kartini Simulator
# ============================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import math
import asyncio
from datetime import datetime

app = FastAPI(
    title="Reaktor Kartini API",
    description="Backend API untuk Simulator Reaktor Kartini",
    version="1.0.0"
)

# CORS - izinkan request dari frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================

class RodPositionInput(BaseModel):
    safety_rod: float = Field(ge=0, le=100, description="Posisi Safety Rod (%)")
    shim_rod: float = Field(ge=0, le=100, description="Posisi Shim Rod (%)")
    regulating_rod: float = Field(ge=0, le=100, description="Posisi Regulating Rod (%)")
    timestamp: Optional[str] = None

class ReactorOutput(BaseModel):
    power: float
    power_kw: float
    reactivity: float
    period: Optional[float]
    status: str
    neutron_flux: str
    temperature: float
    rod_positions: dict
    calculation_time: str
    scram_triggered: bool = False

# ============================================
# PHYSICS CALCULATION MODULE
# ============================================

class ReactorPhysics:
    """
    Kalkulator fisika reaktor Kartini (TRIGA Mark II)
    
    Parameter spesifik Reaktor Kartini:
    - Daya nominal: 100 kW
    - Bahan bakar: U-ZrH (8.5% enrichment)
    - Moderator: Air ringan
    - Reflektor: Beryllium
    """
    
    # Konstanta reaktor Kartini
    NOMINAL_POWER_KW = 120.0
    SCRAM_THRESHOLD_KW = 110.0      # ← BARU: Auto-SCRAM threshold
    SCRAM_THRESHOLD_PERCENT = (110.0 / 120.0) * 100  # = 91.667%

    PROMPT_NEUTRON_LIFETIME = 40e-6  # 40 mikro-sekon (s)
    DELAYED_NEUTRON_FRACTION = 0.0064  # beta-eff
    
    # Koefisien reaktivitas batang kendali (dalam %dk/k per cm)
    # Berdasarkan karakteristik Reaktor Kartini
    SAFETY_ROD_WORTH = 0.045    # %dk/k per % withdrawal
    SHIM_ROD_WORTH = 0.038      # %dk/k per % withdrawal
    REG_ROD_WORTH = 0.012       # %dk/k per % withdrawal
    
    # Reaktivitas kelebihan bahan bakar
    EXCESS_REACTIVITY = 4.2    # % dk/k
    
    @classmethod
    def calculate_rod_reactivity(cls, safety: float, shim: float, regulating: float) -> float:
        """
        Hitung total reaktivitas dari posisi batang kendali
        menggunakan fungsi nilai integral batang berbentuk sinusoidal
        """
        def integral_rod_worth(position_percent: float, total_worth: float) -> float:
            """
            Fungsi integral nilai batang (sinusoidal distribution)
            position: 0 = fully inserted (100% absorbed) 1 = fully withdrawn (0% absorbed)
            """
            x = position_percent / 100.0
            # Integral sinusoidal: rho = (worth/2) * (x - sin(2*pi*x)/(2*pi))
            integral = (x - math.sin(2 * math.pi * x) / (2 * math.pi))
            return total_worth * integral
        
        # Reaktivitas dari setiap batang
        rho_safety = integral_rod_worth(safety, cls.SAFETY_ROD_WORTH * 100)
        rho_shim = integral_rod_worth(shim, cls.SHIM_ROD_WORTH * 100)
        rho_reg = integral_rod_worth(regulating, cls.REG_ROD_WORTH * 100)
        
        # Total reaktivitas = reaktivitas_batang - reaktivitas_kelebihan
        # (semua batang terangkat penuh = kritis)
        total_withdrawal_max = (
            cls.SAFETY_ROD_WORTH * 100 + 
            cls.SHIM_ROD_WORTH * 100 + 
            cls.REG_ROD_WORTH * 100
        )
        
        rho_total = rho_safety + rho_shim + rho_reg - cls.EXCESS_REACTIVITY
        
        return rho_total  # dalam %dk/k
    
    @classmethod
    def calculate_reactor_period(cls, reactivity_pcm: float) -> Optional[float]:
        """
        Hitung periode reaktor menggunakan persamaan inhour
        reactivity dalam pcm (1 pcm = 0.001 %dk/k)
        """
        if reactivity_pcm <= 0:
            return None
        
        reactivity = reactivity_pcm / 1e5  # konversi ke dk/k
        
        if reactivity >= cls.DELAYED_NEUTRON_FRACTION:
            # Prompt critical - periode sangat pendek
            return cls.PROMPT_NEUTRON_LIFETIME / (reactivity - cls.DELAYED_NEUTRON_FRACTION)
        else:
            # Persamaan inhour sederhana
            return cls.DELAYED_NEUTRON_FRACTION / (reactivity * 0.0785)
    
    @classmethod
    def calculate_power(cls, reactivity_pcm: float, current_power: float = 1.0) -> dict:
        """
        Hitung daya reaktor berdasarkan reaktivitas
        Menggunakan point kinetics equation (simplified)
        """
        beta_eff = cls.DELAYED_NEUTRON_FRACTION
        reactivity = reactivity_pcm / 1e5  # dk/k
        
        if reactivity < -0.01:
            # Subcritical - daya menurun
            power_fraction = 0.0
            status = "SHUTDOWN"
        elif abs(reactivity) < 0.0001:
            # Critical - daya stabil
            power_fraction = 1.0
            status = "OPERATING"
        elif reactivity > 0:
            # Supercritical - daya naik
            # Simplified: P = P0 * exp(reactivity * t / l*)
            # Untuk simulasi: tampilkan daya maksimum berdasarkan reaktivitas
            power_fraction = min(1.0, 1.0 + reactivity / beta_eff * 0.5)
            status = "OPERATING"
        else:
            power_fraction = max(0, 1 + reactivity / 0.01)
            status = "SUBCRITICAL"
        
        power_kw = power_fraction * cls.NOMINAL_POWER_KW
        power_percent = (power_fraction / cls.NOMINAL_POWER_KW) * 100
        
        # ← BARU: Cek apakah melewati threshold SCRAM
        scram_triggered = power_kw >= cls.SCRAM_THRESHOLD_KW
        if scram_triggered:
            status = "SCRAM_TRIGGERED"

        # Hitung fluks neutron (n/cm²s)
        # Fluks nominal Kartini ~1e12 n/cm²s pada 100 kW
        neutron_flux = power_fraction * 1e12
        
        # Temperatur air kolam (sederhana)
        temperature = 25 + power_fraction * 15  # 25-40°C
        
        # Periode reaktor
        period = cls.calculate_reactor_period(reactivity_pcm)
        
        return {
            "power_percent": power_percent,
            "power_kw": power_kw,
            "status": status,
            "neutron_flux": neutron_flux,
            "temperature": temperature,
            "period": period,
            "scram_triggered": scram_triggered,  # ← BARU
        }

# ============================================
# ROUTES
# ============================================

@app.get("/")
async def root():
    return {
        "message": "Reaktor Kartini Simulator API",
        "version": "1.0.0",
        "status": "online"
    }

@app.post("/reactor/calculate", response_model=ReactorOutput)
async def calculate_reactor(rod_input: RodPositionInput):
    """
    Terima posisi batang kendali dan hitung daya reaktor
    """
    try:
        # Hitung reaktivitas
        reactivity_pkk = ReactorPhysics.calculate_rod_reactivity(
            safety=rod_input.safety_rod,
            shim=rod_input.shim_rod,
            regulating=rod_input.regulating_rod,
        )
        
        # Konversi ke pcm
        reactivity_pcm = reactivity_pkk * 1000  # %dk/k * 1000 = pcm
        
        # Hitung parameter reaktor
        reactor_params = ReactorPhysics.calculate_power(reactivity_pcm)
        
        return ReactorOutput(
            power=round(reactor_params["power_percent"], 2),
            power_kw=round(reactor_params["power_kw"], 2),
            reactivity=round(reactivity_pcm, 3),
            period=round(reactor_params["period"], 2) if reactor_params["period"] else None,
            status=reactor_params["status"],
            neutron_flux=f"{reactor_params['neutron_flux']:.2e}",
            temperature=round(reactor_params["temperature"], 1),
            rod_positions={
                "safety": rod_input.safety_rod,
                "shim": rod_input.shim_rod,
                "regulating": rod_input.regulating_rod,
            },
            calculation_time=datetime.now().isoformat(),
            scram_triggered=reactor_params["scram_triggered"],
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@app.post("/reactor/scram")
async def scram_reactor():
    """Emergency stop - SCRAM"""
    return {
        "status": "SCRAM",
        "power": 0,
        "power_kw": 0,
        "message": "Reactor scrammed successfully. All control rods inserted.",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/reactor/status")
async def get_status():
    """Get reactor system status"""
    return {
        "status": "online",
        "api_version": "1.0.0",
        "reactor": "Kartini TRIGA Mark II",
        "location": "BATAN Yogyakarta",
        "timestamp": datetime.now().isoformat(),
    }

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )