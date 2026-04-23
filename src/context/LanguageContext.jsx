// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const translations = {
    id: {
        // ── Home & Prepare ──
        homeDescription: 'Simulasi virtual Reaktor Kartini – Reaktor Riset TRIGA Mark II milik BRIN Yogyakarta. Kendalikan batang kontrol, pantau daya reaktor, dan pelajari fisika reaktor nuklir secara aman.',
        homeSubtitle: 'SISTEM SIMULATOR INTERAKTIF',
        feature1Title: 'ZONA PEMBELAJARAN',
        feature1Desc: 'Pahami struktur reaktor, komponen utama, dan prinsip kerja reaktor riset TRIGA Mark II',
        feature2Title: 'TANTANGAN AWAL',
        feature2Desc: 'Mulai perjalananmu  dengan ujian awal untuk menguji pemahaman dasar tentang reaktor nuklir',
        feature3Title: 'ARENA SIMULASI',
        feature3Desc: 'Uji kemampuanmu dalam mengelola daya reaktor agar beroperasi pada daya yang stabil',
        feature4Title: 'TANTANGAN AKHIR',
        feature4Desc: 'Hadapi ujian akhir untuk menguji pemahamanmu tentang reaktor nuklir',
        // ── Navigasi & Button ──
        btnSelengkapnya: 'SELENGKAPNYA →',
        btnMulai: 'MULAI SIMULASI →',
        btnKembali: '← KEMBALI',
        hintKlik: 'Klik untuk memulai simulasi interaktif',
        // ── Footer ──
        footerText: '© 2026 Reaktor Kartini Simulator | BRIN Indonesia',
        footerSub: 'Dirancang untuk keperluan edukasi dan simulasi',
        // ── Section Labels ──
        sectionFeature: 'PANDUAN PENGGUNAAN',
        labelSpesifikasi: 'SPESIFIKASI',
        specsTitle: '⚛ SPESIFIKASI REAKTOR',
        requirementHint: 'Selesaikan Tahap 1 & 2 untuk membuka simulasi',
        //--feature card
        progressLabel: 'PROGRESS PEMBELAJARAN',
        progressLocked: 'Selesaikan terlebih dahulu:',
        progressDone: 'Tahap selesai!',
        progressIncomplete: 'Selesaikan semua tahap terlebih dahulu!',
        progressReset: ' Progress direset',
        resetProgress: '↺ Reset Progress',
        stepDone: ' Selesai',
        stepOpen: ' Buka',
        stepLocked: ' Terkunci',
        // ── Materi Page ──
        materiPageTitle: 'MATERI REAKTOR KARTINI',
        materiPageSubtitle: 'PENGETAHUAN DASAR REAKTOR NUKLIR',
        materiBack: '← KEMBALI',
        materiProgress: 'SELESAI MEMBACA',
        materiReadAll: 'Tandai Selesai',
        materiDone: '✓ Materi Selesai Dibaca',
        materiProgressLabel: 'PROGRESS MEMBACA',
        materiDoneBanner: 'Selamat! Kamu telah menyelesaikan semua materi. Zona Pembelajaran telah selesai!',
        materiTagDone: 'SELESAI',
        materiBackGuide: '← KEMBALI KE PANDUAN',
        // Sections
        materi1Title: 'Apa Itu Reaktor Kartini?',
        materi1Content: 'Reaktor Kartini adalah reaktor riset nuklir tipe TRIGA Mark II yang dimiliki dan dioperasikan oleh Badan Riset dan Inovasi Nasional (BRIN) di Yogyakarta, Indonesia. Reaktor ini memiliki daya nominal 100 kW dan telah beroperasi sejak tahun 1979. Nama "Kartini" diambil dari pahlawan nasional Indonesia, R.A. Kartini, sebagai simbol kemajuan ilmu pengetahuan dan emansipasi.',
        materi2Title: 'Sejarah Singkat',
        materi2Content: 'Reaktor Kartini dibangun pada tahun 1974 dan mulai beroperasi secara resmi pada 1979. Reaktor ini dirancang dan diproduksi oleh General Atomics, Amerika Serikat. Sejak beroperasi, reaktor ini telah digunakan untuk berbagai keperluan riset, pendidikan, dan produksi isotop. Reaktor Kartini merupakan salah satu fasilitas nuklir tertua yang masih aktif beroperasi di Indonesia.',
        materi3Title: 'Tipe TRIGA Mark II',
        materi3Content: 'TRIGA (Training, Research, Isotopes, General Atomics) Mark II adalah jenis reaktor riset yang dirancang khusus untuk pelatihan, penelitian, dan produksi isotop. Reaktor tipe ini dikenal sangat aman karena menggunakan bahan bakar U-ZrH (Uranium-Zirkonium Hidrida) yang memiliki koefisien temperatur negatif — artinya ketika suhu naik, reaktivitas otomatis turun sehingga reaktor self-limiting atau bisa mematikan dirinya sendiri.',
        materi4Title: 'Komponen Utama Reaktor',
        materi4Content: 'Reaktor Kartini terdiri dari beberapa komponen utama: (1) Teras Reaktor — tempat berlangsungnya reaksi fisi nuklir berisi elemen bahan bakar U-ZrH; (2) Batang Kendali — terdiri dari Safety Rod, Shim Rod, dan Regulating Rod yang berfungsi mengontrol laju reaksi; (3) Moderator — menggunakan air ringan (H₂O) untuk memperlambat neutron; (4) Reflektor — memantulkan neutron kembali ke teras; (5) Perisai Biologi — melindungi operator dari radiasi.',
        materi5Title: 'Batang Kendali (Control Rods)',
        materi5Content: 'Batang kendali adalah komponen kritis dalam operasi reaktor. Reaktor Kartini memiliki tiga jenis batang kendali: (1) Safety Rod — batang keselamatan yang digunakan saat startup dan shutdown darurat (SCRAM). Harus berada pada posisi 100% untuk reaktor beroperasi; (2) Shim Rod — digunakan untuk kontrol reaktivitas kasar dan pengaturan daya besar; (3) Regulating Rod — digunakan untuk fine-tuning daya reaktor secara presisi.',
        materi6Title: 'Prinsip Kerja Reaktor Nuklir',
        materi6Content: 'Reaktor nuklir bekerja berdasarkan prinsip reaksi fisi berantai. Neutron menumbuk inti atom Uranium-235, menyebabkan inti tersebut terbelah menjadi dua inti lebih kecil sambil melepaskan energi (panas) dan 2-3 neutron baru. Neutron-neutron baru ini kemudian diperlambat oleh moderator (air) dan menumbuk inti U-235 lainnya, menciptakan reaksi berantai yang terkontrol. Energi panas yang dihasilkan dapat digunakan untuk berbagai keperluan riset.',
        materi7Title: 'Sistem Keselamatan SCRAM',
        materi7Content: 'SCRAM (Safety Control Rod Axe Man) adalah sistem penghentian darurat reaktor. Ketika kondisi abnormal terdeteksi — seperti daya melebihi batas, gempa bumi, atau kegagalan sistem — semua batang kendali dijatuhkan secara otomatis ke posisi 0% dalam hitungan detik. Sistem ini memastikan reaktor berhenti beroperasi dengan aman. Pada Reaktor Kartini, SCRAM diaktifkan otomatis ketika daya mencapai 110 kW (110% dari daya nominal).',
        materi8Title: 'Efek Cherenkov',
        materi8Content: 'Efek Cherenkov adalah cahaya biru yang terlihat di kolam reaktor nuklir. Fenomena ini terjadi ketika partikel bermuatan (seperti elektron hasil radiasi) bergerak melalui air dengan kecepatan lebih tinggi dari kecepatan cahaya dalam medium tersebut. Sama seperti boom sonik pesawat supersonik, partikel yang bergerak sangat cepat ini menghasilkan "ledakan cahaya" yang tampak berwarna biru keunguan. Efek ini merupakan tanda bahwa reaktor sedang beroperasi aktif.',
        materi9Title: 'Kegunaan Reaktor Kartini',
        materi9Content: 'Reaktor Kartini memiliki berbagai fungsi penting: (1) Penelitian Fisika Nuklir — mempelajari sifat neutron dan reaksi nuklir; (2) Produksi Radioisotop — menghasilkan isotop radioaktif untuk keperluan medis dan industri; (3) Analisis Aktivasi Neutron — mengidentifikasi komposisi material dengan mengaktifkannya dengan neutron; (4) Uji Material — menguji ketahanan material terhadap radiasi; (5) Pendidikan dan Pelatihan — melatih tenaga ahli nuklir Indonesia.',
        materi10Title: 'Keamanan dan Regulasi',
        materi10Content: 'Reaktor Kartini beroperasi di bawah pengawasan ketat Badan Pengawas Tenaga Nuklir (BAPETEN) sesuai regulasi keselamatan nuklir internasional IAEA. Setiap operasi reaktor dipantau oleh operator terlatih bersertifikat. Sistem keselamatan berlapis memastikan tidak ada radiasi yang bocor ke lingkungan. Reaktor ini telah memiliki rekam jejak keselamatan yang sangat baik selama lebih dari 40 tahun operasinya.',
        // ── Specs ──
        specTipe: 'TIPE',
        specDaya: 'DAYA NOMINAL',
        specBakar: 'BAHAN BAKAR',
        specModerator: 'MODERATOR',
        specModeratorVal: 'Air Ringan',
        specLokasi: 'LOKASI',
        specStatus: 'STATUS',
        specStatusVal: 'AKTIF',
        // ── Simulation Header ──
        backBtn: '← KEMBALI',
        simTitle: 'GLOWLAB REAKTOR KARTINI',
        simSubtitle: 'ADVANCE REACTOR SIMULATION',
        labelDaya: 'DAYA',
        labelWaktu: 'WAKTU OPERASI',
        hintOrbit: 'Drag Rotate · Scroll Zoom',
        scramActive: 'SCRAM AKTIF',
        cherenkov: 'EFEK CHERENKOV',
        loading: 'MEMUAT SIMULASI...',
        resetScram: 'RESET SCRAM',
        resetSub: 'Klik untuk reset',
        scramCancel: 'Lepas untuk batalkan',
        scramHold: 'TAHAN UNTUK AKTIF',
        rodSafety: 'SAFETY',
        rodShim: 'SHIM',
        rodReg: 'REG',
        status: {
            OPERATING: 'OPERASI',
            SUBCRITICAL: 'SUBKRITIS',
            SHUTDOWN: 'SHUTDOWN',
            SCRAM: 'SCRAM',
        },
        // ── Control Panel ──
        title: 'PANEL KONTROL',
        apiOnline: 'API ONLINE',
        apiOffline: 'API OFFLINE',
        apiError: 'API ERROR',
        control: 'KONTROL',
        monitor: 'MONITOR',
        guide: 'PANDUAN',
        interlock: 'INTERLOCK',
        interlockOn: 'AKTIF',
        interlockOff: 'TIDAK AKTIF',
        interlockSubOn: 'Sistem interlock aktif – batang kendali siap dioperasikan',
        interlockSubOff: 'Tahan SHIFT untuk mengoperasikan batang kendali',
        shiftRequired: '⚠ Tekan Shift untuk mengoperasikan batang kendali',
        scramRequired: '⚠ Reaktor dalam kondisi SCRAM. Reset terlebih dahulu.',
        naikSign: '▲ NAIK',
        turunSign: '▼ TURUN',
        // ── Monitor Tab ──
        monitorTitle: 'DAYA REAKTOR',
        reactorOff: 'REAKTOR MATI',
        reactorOn: 'REAKTOR BEROPERASI',
        reactorSub: 'SUBKRITIS',
        reactorScram: 'SCRAM AKTIF',
        posisBatangKendali: 'POSISI BATANG KENDALI',
        // ── Guide Tab ──
        guideTitle: 'PANDUAN KEYBOARD',
        noteTitle: '⚠ CATATAN OPERASI',
        notes: [
            'Safety Rod harus 100% agar reaktor beroperasi',
            'Naikkan Safety Rod terlebih dahulu',
            'Gunakan Shim untuk reaktivitas kasar',
            'Regulating untuk fine-tuning daya',
            'SCRAM menurunkan semua batang ke 0%',
        ],
        guideRows: [
            { key: 'SHIFT', desc: 'Interlock – wajib ditekan' },
            { key: 'Shift + Q', desc: 'Safety Rod ▲ Naik' },
            { key: 'Shift + A', desc: 'Safety Rod ▼ Turun' },
            { key: 'Shift + W', desc: 'Shim Rod ▲ Naik' },
            { key: 'Shift + S', desc: 'Shim Rod ▼ Turun' },
            { key: 'Shift + E', desc: 'Regulating ▲ Naik' },
            { key: 'Shift + D', desc: 'Regulating ▼ Turun' },
        ],
    },

    en: {
        // ── Home & Prepare ──
        homeDescription: 'Virtual simulation of Kartini Reactor – TRIGA Mark II Research Reactor owned by BRIN Yogyakarta. Control rods, monitor reactor power, and learn nuclear reactor physics safely.',
        homeSubtitle: 'INTERACTIVE SIMULATOR SYSTEM',
        feature1Title: 'LEARNING ZONE',
        feature1Desc: 'Understand the reactor structure, main components, and operating principles of the TRIGA Mark II research reactor',
        feature2Title: 'EARLY CHALLENGE',
        feature2Desc: 'Start your journey with an initial exam to test your basic understanding of nuclear reactors',
        feature3Title: 'SIMULATED ARENA',
        feature3Desc: 'Test your ability to manage reactor power to ensure stable operation',
        feature4Title: 'FINAL CHALLENGE',
        feature4Desc: 'Take a final exam to test your understanding of nuclear reactors',
        // ── Materi Page ──
        materiPageTitle: 'KARTINI REACTOR MATERIAL',
        materiPageSubtitle: 'BASIC KNOWLEDGE OF NUCLEAR REACTOR',
        materiBack: '← BACK',
        materiProgress: 'READING COMPLETE',
        materiReadAll: 'Mark as Done',
        materiDone: '✓ Material Completed',
        materiProgressLabel: 'READING PROGRESS',
        materiDoneBanner: 'Congratulations! You have completed all materials. Learning Zone is complete!',
        materiTagDone: 'DONE',
        materiBackGuide: '← BACK TO GUIDE',
        materi1Title: 'What is the Kartini Reactor?',
        materi1Content: 'The Kartini Reactor is a TRIGA Mark II type research nuclear reactor owned and operated by the National Research and Innovation Agency (BRIN) in Yogyakarta, Indonesia. It has a nominal power of 100 kW and has been operating since 1979. The name "Kartini" is taken from the Indonesian national hero, R.A. Kartini, as a symbol of scientific progress and emancipation.',
        materi2Title: 'Brief History',
        materi2Content: 'The Kartini Reactor was built in 1974 and officially began operating in 1979. It was designed and manufactured by General Atomics, USA. Since its operation, this reactor has been used for various research, educational, and isotope production purposes. The Kartini Reactor is one of the oldest nuclear facilities still actively operating in Indonesia.',
        materi3Title: 'TRIGA Mark II Type',
        materi3Content: 'TRIGA (Training, Research, Isotopes, General Atomics) Mark II is a type of research reactor specifically designed for training, research, and isotope production. This type of reactor is known to be very safe because it uses U-ZrH (Uranium-Zirconium Hydride) fuel which has a negative temperature coefficient — meaning when temperature rises, reactivity automatically decreases making the reactor self-limiting.',
        materi4Title: 'Main Reactor Components',
        materi4Content: 'The Kartini Reactor consists of several main components: (1) Reactor Core — where nuclear fission reactions take place containing U-ZrH fuel elements; (2) Control Rods — consisting of Safety Rod, Shim Rod, and Regulating Rod to control reaction rate; (3) Moderator — uses light water (H₂O) to slow down neutrons; (4) Reflector — reflects neutrons back to the core; (5) Biological Shield — protects operators from radiation.',
        materi5Title: 'Control Rods',
        materi5Content: 'Control rods are critical components in reactor operation. The Kartini Reactor has three types: (1) Safety Rod — used during startup and emergency shutdown (SCRAM), must be at 100% for reactor operation; (2) Shim Rod — used for coarse reactivity control and large power adjustments; (3) Regulating Rod — used for precise fine-tuning of reactor power.',
        materi6Title: 'Nuclear Reactor Working Principle',
        materi6Content: 'A nuclear reactor works based on the principle of chain fission reactions. A neutron strikes a Uranium-235 nucleus, causing it to split into two smaller nuclei while releasing energy (heat) and 2-3 new neutrons. These new neutrons are then slowed by the moderator (water) and strike other U-235 nuclei, creating a controlled chain reaction. The heat energy produced can be used for various research purposes.',
        materi7Title: 'SCRAM Safety System',
        materi7Content: 'SCRAM (Safety Control Rod Axe Man) is the reactor emergency shutdown system. When abnormal conditions are detected — such as power exceeding limits, earthquakes, or system failures — all control rods are automatically dropped to 0% position within seconds. This system ensures the reactor stops operating safely. In the Kartini Reactor, SCRAM is automatically activated when power reaches 110 kW (110% of nominal power).',
        materi8Title: 'Cherenkov Effect',
        materi8Content: 'The Cherenkov effect is the blue light visible in nuclear reactor pools. This phenomenon occurs when charged particles (such as electrons from radiation) move through water at speeds higher than the speed of light in that medium. Similar to a sonic boom from a supersonic aircraft, these very fast-moving particles produce a "light explosion" that appears blue-purple. This effect is a sign that the reactor is actively operating.',
        materi9Title: 'Uses of Kartini Reactor',
        materi9Content: 'The Kartini Reactor has various important functions: (1) Nuclear Physics Research; (2) Radioisotope Production for medical and industrial purposes; (3) Neutron Activation Analysis — identifying material composition; (4) Material Testing — testing material resistance to radiation; (5) Education and Training — training Indonesian nuclear experts.',
        materi10Title: 'Safety and Regulation',
        materi10Content: 'The Kartini Reactor operates under strict supervision of the Nuclear Energy Regulatory Agency (BAPETEN) in accordance with IAEA international nuclear safety regulations. Each reactor operation is monitored by certified trained operators. The layered safety system ensures no radiation leaks into the environment. This reactor has had an excellent safety record for over 40 years of operation.',
        // ── Navigasi & Button ──
        btnSelengkapnya: 'LEARN MORE →',
        btnMulai: 'START SIMULATION →',
        btnKembali: '← BACK',
        hintKlik: 'Click to start the interactive simulation',
        // ── Footer ──
        footerText: '© 2026 Kartini Reactor Simulator | BRIN Indonesia',
        footerSub: 'Designed for educational and simulation purposes',
        // ── Section Labels ──
        sectionFeature: 'USAGE GUIDE',
        labelSpesifikasi: 'SPECIFICATIONS',
        specsTitle: '⚛ REACTOR SPECIFICATIONS',
        requirementHint: 'Complete Step 1 & 2 to unlock the simulation',
        //--feature card
        progressLabel: 'LEARNING PROGRESS',
        progressLocked: 'Complete this first:',
        progressDone: 'Step completed!',
        progressIncomplete: 'Complete all steps first!',
        progressReset: ' Progress reset',
        resetProgress: '↺ Reset Progress',
        stepDone: ' Done',
        stepOpen: ' Open',
        stepLocked: ' Locked',
        // ── Specs ──
        specTipe: 'TYPE',
        specDaya: 'NOMINAL POWER',
        specBakar: 'FUEL',
        specModerator: 'MODERATOR',
        specModeratorVal: 'Light Water',
        specLokasi: 'LOCATION',
        specStatus: 'STATUS',
        specStatusVal: 'ACTIVE',
        // ── Simulation Header ──
        backBtn: '← BACK',
        simTitle: 'GLOWLAB KARTINI REACTOR',
        simSubtitle: 'ADVANCE REACTOR SIMULATION',
        labelDaya: 'POWER',
        labelWaktu: 'OPERATION TIME',
        hintOrbit: 'Drag Rotate · Scroll Zoom',
        scramActive: 'SCRAM ACTIVE',
        cherenkov: 'CHERENKOV EFFECT',
        loading: 'LOADING SIMULATION...',
        resetScram: 'RESET SCRAM',
        resetSub: 'Click to reset',
        scramCancel: 'Release to cancel',
        scramHold: 'HOLD TO ACTIVATE',
        rodSafety: 'SAFETY',
        rodShim: 'SHIM',
        rodReg: 'REG',
        status: {
            OPERATING: 'OPERATING',
            SUBCRITICAL: 'SUBCRITICAL',
            SHUTDOWN: 'SHUTDOWN',
            SCRAM: 'SCRAM',
        },
        // ── Control Panel ──
        title: 'CONTROL PANEL',
        apiOnline: 'API ONLINE',
        apiOffline: 'API OFFLINE',
        apiError: 'API ERROR',
        control: 'Control',
        monitor: 'Monitor',
        guide: 'Guide',
        interlock: 'INTERLOCK',
        interlockOn: 'ACTIVE',
        interlockOff: 'INACTIVE',
        interlockSubOn: 'Interlock active – control rods ready to operate',
        interlockSubOff: 'Hold SHIFT to operate control rods',
        shiftRequired: '⚠ Press Shift to operate control rods',
        scramRequired: '⚠ Reactor is in SCRAM condition. Reset first.',
        naikSign: '▲ UP',
        turunSign: '▼ DOWN',
        // ── Monitor Tab ──
        monitorTitle: 'REACTOR POWER',
        reactorOff: 'REACTOR OFF',
        reactorOn: 'REACTOR OPERATING',
        reactorSub: 'SUBCRITICAL',
        reactorScram: 'SCRAM ACTIVE',
        posisBatangKendali: 'CONTROL ROD POSITION',
        // ── Guide Tab ──
        guideTitle: 'KEYBOARD GUIDE',
        noteTitle: '⚠ OPERATION NOTES',
        notes: [
            'Safety Rod must be 100% for reactor to operate',
            'Raise Safety Rod first',
            'Use Shim for coarse reactivity',
            'Regulating for fine power tuning',
            'SCRAM drops all rods to 0%',
        ],
        guideRows: [
            { key: 'SHIFT', desc: 'Interlock – must be held' },
            { key: 'Shift + Q', desc: 'Safety Rod ▲ Up' },
            { key: 'Shift + A', desc: 'Safety Rod ▼ Down' },
            { key: 'Shift + W', desc: 'Shim Rod ▲ Up' },
            { key: 'Shift + S', desc: 'Shim Rod ▼ Down' },
            { key: 'Shift + E', desc: 'Regulating ▲ Up' },
            { key: 'Shift + D', desc: 'Regulating ▼ Down' },
        ],
    },
}

// ── Context ──
const LanguageContext = createContext(null)

// ── Provider ──
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        try {
            const saved = localStorage.getItem('reaktor-language')
            if (saved === 'id' || saved === 'en') return saved
        } catch (e) {
            console.warn('localStorage tidak tersedia:', e)
        }
        return 'id'
    })

    useEffect(() => {
        try {
            localStorage.setItem('reaktor-language', language)
        } catch (e) {
            console.warn('Gagal menyimpan bahasa:', e)
        }
    }, [language])

    const changeLanguage = (lang) => {
        if (lang === 'id' || lang === 'en') {
            setLanguage(lang)
        }
    }

    const t = (key) => {
        return translations[language]?.[key] || translations['id']?.[key] || key
    }

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: changeLanguage,
            t,
            ...translations[language],
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

// ── Hook - HANYA SATU ──
export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage harus digunakan dalam LanguageProvider')
    }
    return context
}

export default LanguageContext