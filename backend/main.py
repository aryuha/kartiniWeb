# ============================================
# FASTAPI BACKEND - Reaktor Kartini Simulator
# ============================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
import asyncio
import json
import math
import random
import os
import tempfile
import atexit
from datetime import datetime
import mysql.connector

# Setup SSL CA cert for Aiven (written from env var to temp file once at startup)
_ssl_ca_path = None

def _setup_ssl_ca():
    global _ssl_ca_path
    ca_content = os.getenv("DB_SSL_CA", "")
    if ca_content:
        f = tempfile.NamedTemporaryFile(mode="w", suffix=".pem", delete=False)
        f.write(ca_content)
        f.close()
        _ssl_ca_path = f.name
        atexit.register(lambda: os.path.exists(_ssl_ca_path) and os.unlink(_ssl_ca_path))

_setup_ssl_ca()

app = FastAPI(
    title="Reaktor Kartini API",
    description="Backend API untuk Simulator Reaktor Kartini",
    version="1.0.0"
)

# CORS - baca dari env var CORS_ORIGINS (pisahkan dengan koma)
_cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Mysql
# ============================================
def get_db():
    config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "reaktorkartini"),
    }
    if _ssl_ca_path:
        config["ssl_ca"] = _ssl_ca_path
        config["ssl_verify_cert"] = True
    return mysql.connector.connect(**config)

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
        power_percent = power_fraction * 100
        
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
# Skor
# ============================================
class ScoreInput(BaseModel):
    username: str
    score: int
    completion_time: int      # detik
    scram_count: int

class ScoreOutput(BaseModel):
    id: int
    username: str
    score: int
    completion_time: int
    scram_count: int
    created_at: str

# Tambahkan endpoint ini
@app.post("/scores/save")
async def save_score(data: ScoreInput):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO scores (username, score, completion_time, scram_count) VALUES (%s, %s, %s, %s)",
            (data.username, data.score, data.completion_time, data.scram_count)
        )
        db.commit()
        new_id = cursor.lastrowid
        cursor.close()
        db.close()
        return {"success": True, "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scores/leaderboard")
async def get_leaderboard():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM scores ORDER BY score DESC LIMIT 50"
        )
        rows = cursor.fetchall()
        cursor.close()
        db.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# IRL MODE — Real-Time Data Stream (SSE)
# ============================================
# Endpoint ini mensimulasikan data dari Website IRL Kartini.
# Ketika API asli tersedia, ganti _irl_event_generator dengan
# pemanggilan ke URL eksternal tersebut — frontend tidak perlu diubah.

# State internal dummy: nilai awal diambil dari data pengukuran nyata
_irl_state = {
    "compensation_rod":        69.0,
    "regulator_rod":           42.0,
    "power_np1000":            48.792,
    "fuel_element_temp":       88.458,
    "water_tank_temp":         36.612,
    "water_tank_level":         9.34,
    "water_ph":                 7.003,
    "water_resistance_input":   4.61,
    "water_resistance_output": 18.25,
    "inlet_he_temp":           29.127,
    "outlet_he_temp":          30.329,
    "water_flowrate":          38.6,
    "radiation_deck":          14.0,
    "radiation_subcritic":      1.6,
    "radiation_demineralizer":  0.6,
    "radiation_column_thermal": 0.6,
    "radiation_bulkshielding":  1.1,
}

def _drift(value: float, step: float, lo: float, hi: float) -> float:
    """Geser nilai secara acak kecil, tetap dalam batas lo–hi (random walk realistis)."""
    return max(lo, min(hi, value + random.uniform(-step, step)))

def _generate_irl_dummy_data() -> dict:
    """
    Hasilkan satu snapshot data reaktor IRL dummy.
    Setiap pemanggilan, nilai bergeser sedikit dari nilai sebelumnya
    sehingga terlihat seperti reaktor yang sedang beroperasi normal.
    """
    s = _irl_state

    # Batang kendali — Safety selalu 100 saat operasi normal
    s["compensation_rod"]         = _drift(s["compensation_rod"],         0.5,  60.0,  80.0)
    s["regulator_rod"]            = _drift(s["regulator_rod"],            0.3,  35.0,  55.0)
    # Daya
    s["power_np1000"]             = _drift(s["power_np1000"],             0.4,  40.0,  60.0)
    # Termal & kimia air
    s["fuel_element_temp"]        = _drift(s["fuel_element_temp"],        0.2,  82.0,  95.0)
    s["water_tank_temp"]          = _drift(s["water_tank_temp"],          0.05, 34.0,  40.0)
    s["water_tank_level"]         = _drift(s["water_tank_level"],         0.02,  8.5,  10.5)
    s["water_ph"]                 = _drift(s["water_ph"],                 0.005, 6.8,   7.4)
    s["water_resistance_input"]   = _drift(s["water_resistance_input"],   0.02,  3.5,   6.0)
    s["water_resistance_output"]  = _drift(s["water_resistance_output"],  0.05, 15.0,  22.0)
    # Heat exchanger
    s["inlet_he_temp"]            = _drift(s["inlet_he_temp"],            0.05, 27.0,  32.0)
    s["outlet_he_temp"]           = _drift(s["outlet_he_temp"],           0.05, 28.5,  33.0)
    s["water_flowrate"]           = _drift(s["water_flowrate"],           0.1,  35.0,  42.0)
    # Radiasi
    s["radiation_deck"]           = _drift(s["radiation_deck"],           0.2,  10.0,  20.0)
    s["radiation_subcritic"]      = _drift(s["radiation_subcritic"],      0.05,  1.0,   2.5)
    s["radiation_demineralizer"]  = _drift(s["radiation_demineralizer"],  0.02,  0.3,   1.0)
    s["radiation_column_thermal"] = _drift(s["radiation_column_thermal"], 0.02,  0.3,   1.0)
    s["radiation_bulkshielding"]  = _drift(s["radiation_bulkshielding"],  0.05,  0.5,   2.0)

    now = datetime.now()

    return {
        # Waktu
        "current_time": now.strftime("%d/%m/%Y %H:%M:%S"),
        "data_time":    now.strftime("%d/%m/%Y %H:%M:%S.") + f"{now.microsecond // 1000:03d}",
        "timestamp":    now.isoformat(),
        # Status
        "status_reaktor": "OPERATING",
        # Posisi batang kendali (%)
        "safety_rod":       100.0,
        "compensation_rod": round(s["compensation_rod"], 1),
        "regulator_rod":    round(s["regulator_rod"],    1),
        # Daya (kW)
        "power_np1000": round(s["power_np1000"], 3),
        # Parameter air reaktor
        "water_tank_temp":         round(s["water_tank_temp"],         3),
        "water_tank_level":        round(s["water_tank_level"],        2),
        "water_ph":                round(s["water_ph"],                3),
        "fuel_element_temp":       round(s["fuel_element_temp"],       3),
        "water_resistance_input":  round(s["water_resistance_input"],  2),
        "water_resistance_output": round(s["water_resistance_output"], 2),
        # Heat exchanger
        "inlet_he_temp":   round(s["inlet_he_temp"],  3),
        "outlet_he_temp":  round(s["outlet_he_temp"], 3),
        "water_flowrate":  round(s["water_flowrate"],  1),
        # Radiasi (µSv/h)
        "radiation_deck":            round(s["radiation_deck"],            1),
        "radiation_subcritic":       round(s["radiation_subcritic"],       1),
        "radiation_demineralizer":   round(s["radiation_demineralizer"],   1),
        "radiation_column_thermal":  round(s["radiation_column_thermal"],  1),
        "radiation_bulkshielding":   round(s["radiation_bulkshielding"],   1),
    }


async def _irl_event_generator():
    """
    Async generator SSE: kirim snapshot setiap 2 detik.
    Format SSE standar: 'data: {json}\\n\\n'
    """
    while True:
        payload = _generate_irl_dummy_data()
        yield f"data: {json.dumps(payload)}\n\n"
        await asyncio.sleep(2)


@app.get("/irl/stream")
async def irl_stream():
    """
    Server-Sent Events — IRL Monitoring Mode.
    Frontend membuka satu koneksi, data reaktor dikirim setiap 2 detik.
    Tidak perlu polling; browser reconnect otomatis jika koneksi putus.
    """
    return StreamingResponse(
        _irl_event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",   # cegah Nginx buffer SSE
            "Connection":       "keep-alive",
        },
    )


@app.get("/irl/snapshot")
async def irl_snapshot():
    """
    Satu kali fetch data IRL terbaru (tanpa streaming).
    Berguna untuk inisialisasi awal sebelum SSE terhubung.
    """
    return _generate_irl_dummy_data()


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