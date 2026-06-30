// src/components/three/componentDetails.js
// ════════════════════════════════════════════════════════
// TEKS DETAIL untuk tiap komponen reaktor.
// Ini adalah CONTOH/DRAFT — silakan edit sesuai data teknis
// Reaktor Kartini yang sebenarnya (referensi BRIN/BAPETEN).
// ════════════════════════════════════════════════════════

export const COMPONENT_DETAILS = {
  core: {
    id: {
      detail:
        "Teras reaktor adalah jantung dari Reaktor Kartini, berisi 1 susunan elemen bahan bakar U-ZrH (Uranium-Zirkonium Hidrida) yang disusun membentuk pola heksagonal. Di sinilah reaksi fisi berantai terjadi: neutron menumbuk inti Uranium-235, membelahnya menjadi dua inti lebih kecil sambil melepaskan energi panas dan neutron baru.",
      specs: [
        { label: "Diameter teras", value: "~56 cm" },
        { label: "Tinggi aktif", value: "~38 cm" },
        { label: "Bahan bakar", value: "U-ZrH, 8.5% enrichment" },
        { label: "Daya nominal", value: "100 kW (maks. 120 kW)" },
      ],
    },
    en: {
      detail:
        "The reactor core is the heart of the Kartini Reactor, containing U-ZrH (Uranium-Zirconium Hydride) fuel elements arranged in a hexagonal pattern. This is where the chain fission reaction occurs: neutrons strike Uranium-235 nuclei, splitting them into smaller nuclei while releasing thermal energy and new neutrons.",
      specs: [
        { label: "Core diameter", value: "~56 cm" },
        { label: "Active height", value: "~38 cm" },
        { label: "Fuel type", value: "U-ZrH, 8.5% enrichment" },
        { label: "Nominal power", value: "100 kW (max. 120 kW)" },
      ],
    },
  },

  vessel: {
    id: {
      detail:
        "Bejana reaktor adalah struktur silinder dari aluminium yang membungkus teras dan menahan posisi seluruh elemen bahan bakar serta batang kendali. Bejana ini direndam di dalam kolam air dan berfungsi sebagai kerangka struktural utama yang menjaga geometri kritis reaktor tetap stabil selama operasi.",
      specs: [
        { label: "Material", value: "Paduan aluminium" },
        { label: "Bentuk", value: "Silinder vertikal" },
        { label: "Fungsi utama", value: "Penopang struktur teras" },
      ],
    },
    en: {
      detail:
        "The reactor vessel is a cylindrical aluminum structure that houses the core and holds all fuel elements and control rods in position. Submerged in the pool, it serves as the main structural frame that keeps the reactor's critical geometry stable during operation.",
      specs: [
        { label: "Material", value: "Aluminum alloy" },
        { label: "Shape", value: "Vertical cylinder" },
        { label: "Main function", value: "Core structural support" },
      ],
    },
  },

  pool: {
    id: {
      detail:
        "Kolam reaktor adalah struktur beton besar berlapis baja tahan karat yang menampung air sebagai pendingin dan perisai radiasi. Kedalaman kolam dirancang agar permukaan air tetap aman dari radiasi langsung, memungkinkan operator bekerja di dek atas kolam tanpa perisai tambahan.",
      specs: [
        { label: "Tinggi kolam", value: "~8.5 m" },
        { label: "Material dinding", value: "Beton + lapisan baja" },
        { label: "Fungsi", value: "Perisai radiasi & wadah pendingin" },
      ],
    },
    en: {
      detail:
        "The reactor pool is a large concrete structure lined with stainless steel, holding water that acts as both coolant and radiation shield. Its depth is designed so the water surface stays safe from direct radiation, allowing operators to work on the deck without additional shielding.",
      specs: [
        { label: "Pool height", value: "~8.5 m" },
        { label: "Wall material", value: "Concrete + steel lining" },
        { label: "Function", value: "Radiation shield & coolant container" },
      ],
    },
  },

  water: {
    id: {
      detail:
        "Air kolam berperan ganda: sebagai moderator yang memperlambat neutron cepat hasil fisi agar bisa menumbuk inti U-235 secara efektif, dan sebagai pendingin yang menyerap panas dari teras. Cahaya biru (efek Cherenkov) yang terlihat saat reaktor beroperasi berasal dari partikel bermuatan yang bergerak lebih cepat dari cahaya di dalam air.",
      specs: [
        { label: "Jenis", value: "Air ringan (H₂O) demineralisasi" },
        { label: "Fungsi", value: "Moderator neutron & pendingin" },
        { label: "Suhu operasi", value: "25–40°C (normal)" },
      ],
    },
    en: {
      detail:
        "Pool water serves two roles: as a moderator that slows fast neutrons from fission so they can effectively strike U-235 nuclei, and as a coolant absorbing heat from the core. The blue glow (Cherenkov effect) seen during operation comes from charged particles moving faster than light travels through water.",
      specs: [
        { label: "Type", value: "Demineralized light water (H₂O)" },
        { label: "Function", value: "Neutron moderator & coolant" },
        { label: "Operating temp", value: "25–40°C (normal)" },
      ],
    },
  },

  rod_safety: {
    id: {
      detail:
        "Safety Rod adalah batang kendali utama yang wajib berada di posisi 100% (tercabut penuh) agar reaktor bisa beroperasi. Batang ini dirancang untuk SCRAM — penjatuhan darurat ke posisi 0% dalam hitungan detik — saat kondisi abnormal terdeteksi, menjadikannya garis pertahanan keselamatan pertama reaktor.",
      specs: [
        { label: "Material absorber", value: "Boron Carbide (B₄C)" },
        { label: "Mode operasi", value: "Naik/turun manual + SCRAM otomatis" },
        { label: "Syarat kritis", value: "Harus 100% untuk start-up" },
      ],
    },
    en: {
      detail:
        "The Safety Rod is the primary control rod that must be at 100% (fully withdrawn) for the reactor to operate. It is designed to SCRAM — emergency insertion to 0% within seconds — when abnormal conditions are detected, making it the reactor's first line of safety defense.",
      specs: [
        { label: "Absorber material", value: "Boron Carbide (B₄C)" },
        { label: "Operation mode", value: "Manual up/down + auto SCRAM" },
        { label: "Critical requirement", value: "Must be 100% for startup" },
      ],
    },
  },

  rod_shim: {
    id: {
      detail:
        "Shim Rod digunakan untuk kontrol reaktivitas kasar — biasanya untuk mengkompensasi perubahan reaktivitas besar seperti penambahan/pengurangan bahan bakar atau penyesuaian daya dalam rentang besar. Pergerakannya lebih signifikan dibanding Regulating Rod, sehingga dipakai di awal proses menaikkan daya.",
      specs: [
        { label: "Material absorber", value: "Boron Carbide (B₄C)" },
        { label: "Fungsi", value: "Kontrol reaktivitas kasar" },
        {
          label: "Karakteristik",
          value: "Worth per % lebih besar dari Regulating",
        },
      ],
    },
    en: {
      detail:
        "The Shim Rod is used for coarse reactivity control — typically to compensate for large reactivity changes such as fuel adjustments or major power changes. Its movement has a more significant effect than the Regulating Rod, so it is used early in the power-raising process.",
      specs: [
        { label: "Absorber material", value: "Boron Carbide (B₄C)" },
        { label: "Function", value: "Coarse reactivity control" },
        {
          label: "Characteristic",
          value: "Higher worth per % than Regulating",
        },
      ],
    },
  },

  rod_regulating: {
    id: {
      detail:
        "Regulating Rod digunakan untuk fine-tuning daya reaktor secara presisi. Setelah Safety dan Shim Rod mengatur kondisi mendekati target, Regulating Rod menyesuaikan daya secara halus untuk menjaga reaktor stabil pada level yang diinginkan — inilah batang yang paling sering disesuaikan selama operasi normal.",
      specs: [
        { label: "Material absorber", value: "Boron Carbide (B₄C)" },
        { label: "Fungsi", value: "Fine-tuning daya" },
        {
          label: "Karakteristik",
          value: "Worth per % paling kecil, presisi tinggi",
        },
      ],
    },
    en: {
      detail:
        "The Regulating Rod provides precise fine-tuning of reactor power. After the Safety and Shim Rods bring conditions close to target, the Regulating Rod makes fine adjustments to keep the reactor stable at the desired level — this is the rod most frequently adjusted during normal operation.",
      specs: [
        { label: "Absorber material", value: "Boron Carbide (B₄C)" },
        { label: "Function", value: "Power fine-tuning" },
        {
          label: "Characteristic",
          value: "Smallest worth per %, high precision",
        },
      ],
    },
  },

  pc_operator: {
    id: {
      detail:
        "PC Operator adalah terminal komputer yang digunakan operator untuk memantau parameter reaktor secara digital — termasuk daya, suhu, fluks neutron, dan posisi batang kendali — serta mencatat log operasi sesuai prosedur keselamatan yang diwajibkan regulator.",
      specs: [
        { label: "Fungsi", value: "Monitoring & pencatatan data operasi" },
        { label: "Lokasi", value: "Ruang kendali operator" },
      ],
    },
    en: {
      detail:
        "The Operator PC is the computer terminal used by operators to digitally monitor reactor parameters — including power, temperature, neutron flux, and control rod positions — and to log operations in accordance with regulator-mandated safety procedures.",
      specs: [
        { label: "Function", value: "Operation monitoring & data logging" },
        { label: "Location", value: "Operator control room" },
      ],
    },
  },

  control_panel_room: {
    id: {
      detail:
        "Panel Kontrol di ruang operator berisi indikator fisik dan saklar yang melengkapi kontrol digital. Panel ini menampilkan status sistem keselamatan, interlock, dan indikator SCRAM yang harus selalu terlihat jelas oleh operator selama reaktor beroperasi.",
      specs: [
        { label: "Fungsi", value: "Indikator status & interlock keselamatan" },
        { label: "Lokasi", value: "Ruang kendali operator" },
      ],
    },
    en: {
      detail:
        "The control room panel contains physical indicators and switches that complement digital controls. It displays the status of safety systems, interlocks, and SCRAM indicators that must remain clearly visible to operators throughout reactor operation.",
      specs: [
        { label: "Function", value: "Status indicators & safety interlocks" },
        { label: "Location", value: "Operator control room" },
      ],
    },
  },
};

// Helper: ambil detail sesuai bahasa, dengan fallback ke 'id'
export function getComponentDetail(componentId, language) {
  const entry = COMPONENT_DETAILS[componentId];
  if (!entry) return null;
  return entry[language] || entry.id;
}

// ── Live sensor spec definitions per label ──
const LIVE_SPEC_DEFS = {
  rod_safety: {
    id: [{ src: 'safety', label: 'Posisi', unit: '%', dec: 1, fromRod: true }],
    en: [{ src: 'safety', label: 'Position', unit: '%', dec: 1, fromRod: true }],
  },
  rod_shim: {
    id: [{ src: 'shim', label: 'Posisi', unit: '%', dec: 1, fromRod: true }],
    en: [{ src: 'shim', label: 'Position', unit: '%', dec: 1, fromRod: true }],
  },
  rod_regulating: {
    id: [{ src: 'regulating', label: 'Posisi', unit: '%', dec: 1, fromRod: true }],
    en: [{ src: 'regulating', label: 'Position', unit: '%', dec: 1, fromRod: true }],
  },
  core: {
    id: [{ src: 'fuel_element_temp', label: 'Suhu Elemen Bahan Bakar', unit: '°C', dec: 2 }],
    en: [{ src: 'fuel_element_temp', label: 'Fuel Element Temp', unit: '°C', dec: 2 }],
  },
  water: {
    id: [
      { src: 'water_tank_temp',        label: 'Suhu Tangki Air',    unit: '°C',     dec: 2 },
      { src: 'water_tank_level',       label: 'Ketinggian Air',     unit: 'cm',     dec: 2 },
      { src: 'water_ph',               label: 'pH Air',             unit: '',       dec: 2 },
      { src: 'inlet_he_temp',          label: 'Suhu Masuk HE',      unit: '°C',     dec: 2 },
      { src: 'outlet_he_temp',         label: 'Suhu Keluar HE',     unit: '°C',     dec: 2 },
      { src: 'water_flowrate',         label: 'Laju Aliran',        unit: 'L/min',  dec: 2 },
      { src: 'water_resistance_input', label: 'Resistansi Masuk',   unit: 'MΩ·cm',  dec: 2 },
      { src: 'water_resistance_output',label: 'Resistansi Keluar',  unit: 'MΩ·cm',  dec: 2 },
    ],
    en: [
      { src: 'water_tank_temp',        label: 'Tank Temperature',   unit: '°C',     dec: 2 },
      { src: 'water_tank_level',       label: 'Tank Level',         unit: 'cm',     dec: 2 },
      { src: 'water_ph',               label: 'Water pH',           unit: '',       dec: 2 },
      { src: 'inlet_he_temp',          label: 'Inlet HE Temp',      unit: '°C',     dec: 2 },
      { src: 'outlet_he_temp',         label: 'Outlet HE Temp',     unit: '°C',     dec: 2 },
      { src: 'water_flowrate',         label: 'Flowrate',           unit: 'L/min',  dec: 2 },
      { src: 'water_resistance_input', label: 'Resistance In',      unit: 'MΩ·cm',  dec: 2 },
      { src: 'water_resistance_output',label: 'Resistance Out',     unit: 'MΩ·cm',  dec: 2 },
    ],
  },
  pc_operator: {
    id: [
      { src: 'radiation_deck',           label: 'Dek Reaktor',        unit: 'mSv/h', dec: 4 },
      { src: 'radiation_subcritic',      label: 'Area Subkritik',     unit: 'mSv/h', dec: 4 },
      { src: 'radiation_demineralizer',  label: 'Area Demineralizer', unit: 'mSv/h', dec: 4 },
      { src: 'radiation_column_thermal', label: 'Area Kolom Termal',  unit: 'mSv/h', dec: 4 },
      { src: 'radiation_bulkshielding',  label: 'Area Bulk Shielding',unit: 'mSv/h', dec: 4 },
    ],
    en: [
      { src: 'radiation_deck',           label: 'Reactor Deck',         unit: 'mSv/h', dec: 4 },
      { src: 'radiation_subcritic',      label: 'Subcritic Area',       unit: 'mSv/h', dec: 4 },
      { src: 'radiation_demineralizer',  label: 'Demineralizer Area',   unit: 'mSv/h', dec: 4 },
      { src: 'radiation_column_thermal', label: 'Column Thermal Area',  unit: 'mSv/h', dec: 4 },
      { src: 'radiation_bulkshielding',  label: 'Bulkshielding Area',   unit: 'mSv/h', dec: 4 },
    ],
  },
}

// Helper: build live spec rows from IRL sensor data for a given label.
// Returns [] when liveData/rodPositions are null (SimulationPage — no live feed).
export function getLiveSpecs(labelId, liveData, rodPositions, language) {
  const defs = LIVE_SPEC_DEFS[labelId]
  if (!defs) return []
  const lang = language === 'en' ? 'en' : 'id'
  const rows = defs[lang] || defs.id
  return rows.map(r => {
    const raw = r.fromRod ? rodPositions?.[r.src] : liveData?.[r.src]
    const n = typeof raw === 'number' ? raw : parseFloat(raw)
    const val = !isNaN(n)
      ? `${n.toFixed(r.dec)}${r.unit ? ' ' + r.unit : ''}`
      : '--'
    return { label: r.label, value: val }
  })
}
