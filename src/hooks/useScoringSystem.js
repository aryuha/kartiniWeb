// src/hooks/useScoringSystem.js
// ============================================================
// SISTEM GAMIFIKASI BARU: Target Daya Dinamis per Fase
// ============================================================
import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

// ── Konfigurasi Fase (mudah diubah) ──────────────────────────
// Ubah angka-angka ini untuk mengatur target dan durasi
const PHASES = [
  { target: 50, durationSec: 60, label: "Fase 1" },
  { target: 70, durationSec: 60, label: "Fase 2" },
  { target: 85, durationSec: 60, label: "Fase 3" },
  { target: 100, durationSec: 60, label: "Fase 4" },
  { target: 90, durationSec: 60, label: "Fase 5" },
];

// ── Konstanta Sistem Poin ─────────────────────────────────────
const MAX_PTS_PER_SEC = 10; // poin per detik saat tepat di target
const TOTAL_PHASES = PHASES.length;
const TIME_LIMIT_SEC = PHASES.reduce((sum, p) => sum + p.durationSec, 0); // 300 detik

// ── Helper: Hitung poin berdasarkan jarak dari target ─────────
function calcPointsPerSecond(currentKw, targetKw) {
  if (targetKw === 0) return 0;
  const diff = Math.abs(currentKw - targetKw);
  const pct = diff / targetKw; // persentase jarak (0.0 – 1.0+)

  if (pct <= 0.05) return 10; // dalam 5%  → sempurna
  if (pct <= 0.15) return 7; // dalam 15% → sangat baik
  if (pct <= 0.3) return 4; // dalam 30% → baik
  if (pct <= 0.5) return 2; // dalam 50% → cukup
  return 0; // lebih dari 50% → tidak dapat poin
}

// ── Helper: Teks feedback untuk user ─────────────────────────
function getFeedbackText(currentKw, targetKw, language = "id") {
  if (targetKw === 0) return "";
  const diff = Math.abs(currentKw - targetKw);
  const pct = diff / targetKw;
  const isId = language !== "en";

  if (pct <= 0.05) {
    return isId
      ? "⚡ Sempurna! Daya sangat dekat ke target!"
      : "⚡ Perfect! Power is very close to target!";
  }
  if (pct <= 0.15) {
    return isId
      ? "✓ Sangat baik! Pertahankan daya ini."
      : "✓ Very good! Keep this power level.";
  }
  if (currentKw < targetKw) {
    return isId
      ? `▲ Naikkan daya! Target ${targetKw} kW, sekarang ${currentKw.toFixed(1)} kW`
      : `▲ Increase power! Target ${targetKw} kW, now ${currentKw.toFixed(1)} kW`;
  }
  return isId
    ? `▼ Turunkan daya! Target ${targetKw} kW, sekarang ${currentKw.toFixed(1)} kW`
    : `▼ Decrease power! Target ${targetKw} kW, now ${currentKw.toFixed(1)} kW`;
}

// ── Hook Utama ────────────────────────────────────────────────
export const useScoringSystem = (
  isReactorActive,
  isScrammed,
  reactorData,
  rodPositions,
) => {
  const { language } = useLanguage();
  const isId = language !== "en";
  // State yang ditampilkan ke UI
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // fase saat ini (0–4)
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASES[0].durationSec); // detik tersisa di fase ini
  const [phaseScores, setPhaseScores] = useState(Array(TOTAL_PHASES).fill(0)); // skor tiap fase
  const [totalScore, setTotalScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false); // semua fase selesai
  const [isScrammed_state, setIsScrammedState] = useState(false);
  const [lastNotif, setLastNotif] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [penaltyTotal, setPenaltyTotal] = useState(0);

  // Refs (nilai internal yang tidak perlu trigger re-render)
  const phaseIndexRef = useRef(0);
  const phaseTimeRef = useRef(PHASES[0].durationSec);
  const totalTimeRef = useRef(0);
  const totalScoreRef = useRef(0);
  const phaseScoresRef = useRef(Array(TOTAL_PHASES).fill(0));
  const wasScrammedRef = useRef(false);
  const penaltyRef = useRef(0);
  const penaltyLogRef = useRef([]);

  const SCRAM_PENALTY = 100;

  // ── Reset saat SCRAM ──────────────────────────────────────
  useEffect(() => {
    if (isScrammed && !wasScrammedRef.current) {
      wasScrammedRef.current = true;

      // Catat penalti -100
      penaltyRef.current += SCRAM_PENALTY;
      penaltyLogRef.current = [
        ...penaltyLogRef.current,
        {
          points: -SCRAM_PENALTY,
          atPhase: phaseIndexRef.current + 1,
          atTime: totalTimeRef.current,
        },
      ];
      setPenaltyTotal(penaltyRef.current);

      // Reset progres game
      phaseIndexRef.current = 0;
      phaseTimeRef.current = PHASES[0].durationSec;
      totalTimeRef.current = 0;
      totalScoreRef.current = 0;
      phaseScoresRef.current = Array(TOTAL_PHASES).fill(0);

      setCurrentPhaseIndex(0);
      setPhaseTimeLeft(PHASES[0].durationSec);
      setTotalScore(0);
      setPhaseScores(Array(TOTAL_PHASES).fill(0));
      setTimeElapsed(0);
      setIsFinished(false);
      setLastNotif({
        type: "scram",
        text: isId ? `SCRAM! Penalti -${SCRAM_PENALTY} poin` : `SCRAM! -${SCRAM_PENALTY} penalty`,
        id: Date.now(),
      });
      setFeedbackText("");
    }
    if (!isScrammed) {
      wasScrammedRef.current = false;
    }
  }, [isScrammed, isId]);

  // ── Game Loop Utama (jalan setiap detik) ─────────────────
  useEffect(() => {
    // Hanya jalan saat reaktor aktif, belum selesai, dan tidak SCRAM
    if (!isReactorActive || isFinished || isScrammed) return;

    const interval = setInterval(() => {
      const powerKw = reactorData?.power_kw || 0;
      const phaseIdx = phaseIndexRef.current;
      const phase = PHASES[phaseIdx];

      // 1. Hitung poin detik ini
      const pts = calcPointsPerSecond(powerKw, phase.target);

      // 2. Update skor
      phaseScoresRef.current = phaseScoresRef.current.map((s, i) =>
        i === phaseIdx ? s + pts : s,
      );
      totalScoreRef.current += pts;
      totalTimeRef.current += 1;

      // 3. Update state untuk UI
      setPhaseScores([...phaseScoresRef.current]);
      setTotalScore(totalScoreRef.current);
      setTimeElapsed(totalTimeRef.current);

      // 4. Feedback text
      setFeedbackText(getFeedbackText(powerKw, phase.target, language));

      // 5. Notifikasi poin (muncul sebentar)
      if (pts >= 10) {
        setLastNotif({
          type: "perfect",
          text: isId ? `+${pts} SEMPURNA!` : `+${pts} PERFECT!`,
          id: Date.now(),
        });
      } else if (pts >= 7) {
        setLastNotif({
          type: "good",
          text: isId ? `+${pts} Sangat Baik` : `+${pts} Very Good`,
          id: Date.now(),
        });
      }

      // 6. Hitung waktu tersisa di fase ini
      phaseTimeRef.current -= 1;
      setPhaseTimeLeft(phaseTimeRef.current);

      // 7. Cek apakah fase ini selesai
      if (phaseTimeRef.current <= 0) {
        const nextIdx = phaseIdx + 1;

        if (nextIdx >= TOTAL_PHASES) {
          // Semua fase selesai!
          setIsFinished(true);
          clearInterval(interval);
        } else {
          // Pindah ke fase berikutnya
          phaseIndexRef.current = nextIdx;
          phaseTimeRef.current = PHASES[nextIdx].durationSec;
          setCurrentPhaseIndex(nextIdx);
          setPhaseTimeLeft(PHASES[nextIdx].durationSec);
          setLastNotif({
            type: "phase",
            text: isId
              ? `Fase ${nextIdx + 1} dimulai! Target: ${PHASES[nextIdx].target} kW`
              : `Phase ${nextIdx + 1} started! Target: ${PHASES[nextIdx].target} kW`,
            id: Date.now(),
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReactorActive, isFinished, isScrammed, reactorData, language]);

  // ── Fungsi ambil skor final (dipanggil saat user klik Selesai) ──
  const getFinalScore = useCallback(() => {
    // Hitung grade berdasarkan persentase skor
    const maxPossible = PHASES.reduce(
      (sum, p) => sum + p.durationSec * MAX_PTS_PER_SEC,
      0,
    );
    const percentage = Math.round((totalScoreRef.current / maxPossible) * 100);

    const netScore = Math.max(0, totalScoreRef.current - penaltyRef.current);
    const netPercentage = Math.round((netScore / maxPossible) * 100);

    return {
      finalScore: netScore,
      rawScore: totalScoreRef.current,
      phaseScores: [...phaseScoresRef.current],
      phases: PHASES,
      timeElapsed: totalTimeRef.current,
      maxPossible,
      percentage: netPercentage,
      penaltyTotal: penaltyRef.current,
      bonus: 0,
      penaltyLog: [...penaltyLogRef.current],
    };
  }, []);

  // ── Nilai yang dikembalikan ke komponen ──────────────────
  return {
    // State utama
    currentPhaseIndex, // indeks fase (0–4)
    currentPhase: PHASES[currentPhaseIndex], // objek fase saat ini { target, durationSec, label }
    phaseTimeLeft, // detik tersisa di fase ini
    phaseScores, // array skor tiap fase [120, 450, ...]
    totalScore, // total skor keseluruhan
    timeElapsed, // total detik yang sudah berlalu
    isFinished, // true saat semua 5 fase selesai
    lastNotif, // notifikasi terakhir
    feedbackText, // teks panduan ("naikkan daya!" dll)
    phases: PHASES, // daftar semua fase (untuk ditampilkan di UI)

    // Fungsi
    getFinalScore,

    // Konstanta (untuk dipakai komponen lain)
    TOTAL_PHASES,
    TIME_LIMIT_SEC,
    MAX_PTS_PER_SEC,

    // Kompatibilitas dengan kode lama (agar tidak perlu ubah terlalu banyak)
    score: totalScore,
    isWin: isFinished,
    isTimeOut: false,
    stableSeconds: 0,
    penaltyTotal,
    STABLE_DURATION_SEC: 0,
  };
};
