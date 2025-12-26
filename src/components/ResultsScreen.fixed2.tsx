// src/components/ResultsScreen.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Room } from "../types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// --- PROCEDURAL AUDIO ENGINE (No MP3s required) ---
// NOTE: Browsers block audio until the user performs a gesture (click/tap/keydown).
// This hook exposes `init()` which must run inside a user gesture at least once.
const useCinematicAudio = (enabled: boolean = true) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  const chatterIntervalRef = useRef<number | null>(null);

  const getCtx = useCallback(() => {
    if (!enabled) return null;
    if (typeof window === "undefined") return null;

    if (!ctxRef.current) {
      // @ts-ignore
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }, [enabled]);

  const ensureRunning = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx) return null;

    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {
        // Autoplay policy: resume will fail until a user gesture happens.
      }
    }
    return ctx.state === "running" ? ctx : null;
  }, [getCtx]);

  const init = useCallback(async () => {
    // Must be called from a user gesture at least once.
    return (await ensureRunning()) !== null;
  }, [ensureRunning]);

  const stopAll = useCallback(() => {
    if (typeof window === "undefined") return;

    if (droneGainRef.current && ctxRef.current) {
      const ctx = ctxRef.current;
      const t = ctx.currentTime;
      droneGainRef.current.gain.cancelScheduledValues(t);
      droneGainRef.current.gain.setValueAtTime(droneGainRef.current.gain.value, t);
      droneGainRef.current.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    }

    if (droneOscRef.current) {
      try {
        droneOscRef.current.stop();
      } catch {}
      droneOscRef.current.disconnect();
      droneOscRef.current = null;
    }

    if (lfoOscRef.current) {
      try {
        lfoOscRef.current.stop();
      } catch {}
      lfoOscRef.current.disconnect();
      lfoOscRef.current = null;
    }

    if (chatterIntervalRef.current) {
      window.clearInterval(chatterIntervalRef.current);
      chatterIntervalRef.current = null;
    }
  }, []);

  // 1. Digital Tick
  const playTick = useCallback(() => {
    void (async () => {
      const ctx = await ensureRunning();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
      osc.type = "square";

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    })();
  }, [ensureRunning]);

  // 2. Heavy Impact (Now uses the 'tone' to change pitch)
  const playImpact = useCallback((tone: "neutral" | "success" | "fail" = "neutral") => {
    void (async () => {
      const ctx = await ensureRunning();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = tone === "success" ? 220 : tone === "fail" ? 80 : 150;
      const endFreq = tone === "success" ? 55 : 30;

      osc.type = tone === "fail" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.5);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);

      if (tone === "success") {
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = "sine";
        chime.frequency.setValueAtTime(880, t);
        chime.frequency.exponentialRampToValueAtTime(440, t + 1);
        chimeGain.gain.setValueAtTime(0.1, t);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 2);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(t);
        chime.stop(t + 2);
      }
    })();
  }, [ensureRunning]);

  // 3. Start Suspense Loop
  const startSuspense = useCallback(() => {
    void (async () => {
      const ctx = await ensureRunning();
      if (!ctx) return;

      // Clear any previous loop
      stopAll();

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(55, t);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);

      droneOscRef.current = osc;
      droneGainRef.current = gain;
      lfoOscRef.current = lfo;

      chatterIntervalRef.current = window.setInterval(() => {
        const c = ctxRef.current;
        if (!c || c.state !== "running") return;
        if (Math.random() > 0.4) return;

        const ct = c.currentTime;
        const blip = c.createOscillator();
        const bGain = c.createGain();

        blip.type = "square";
        blip.frequency.setValueAtTime(1000 + Math.random() * 2000, ct);

        bGain.gain.setValueAtTime(0.02, ct);
        bGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.05);

        blip.connect(bGain);
        bGain.connect(c.destination);
        blip.start(ct);
        blip.stop(ct + 0.05);
      }, 80);
    })();
  }, [ensureRunning, stopAll]);

  // 4. Stop Suspense Loop
  const stopSuspense = useCallback(() => {
    if (!ctxRef.current) {
      stopAll();
      return;
    }

    if (droneGainRef.current) {
      const ctx = ctxRef.current;
      const t = ctx.currentTime;
      droneGainRef.current.gain.cancelScheduledValues(t);
      droneGainRef.current.gain.setValueAtTime(droneGainRef.current.gain.value, t);
      droneGainRef.current.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      setTimeout(() => stopAll(), 550);
      return;
    }

    stopAll();
  }, [stopAll]);

  return useMemo(
    () => ({ init, playTick, playImpact, startSuspense, stopSuspense }),
    [init, playTick, playImpact, startSuspense, stopSuspense]
  );
};


// --------------------------------------------------

interface ResultsScreenProps {
  room: Room;
  onReturnToLobby: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ room, onReturnToLobby }) => {
  // 0: TAKEOVER  1: VERDICT  2: DECRYPT  3: TRUTH  4: REPORT
  const [stage, setStage] = useState<number>(0);

  // Stage 2 decrypt + suspense
  const [decryptProgress, setDecryptProgress] = useState<number>(0);
  const [canAdvance, setCanAdvance] = useState<boolean>(false);

  // Stage 2 roulette
  const [rouletteIndex, setRouletteIndex] = useState<number>(0);

  // Initialize Sound Engine
  const sfx = useCinematicAudio(true);
  const hasInitializedAudio = useRef(false);

  // Unlock audio on the first user gesture anywhere (required by browser autoplay policies)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlock = () => {
      if (hasInitializedAudio.current) return;
      hasInitializedAudio.current = true;
      void sfx.init();
    };

    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("touchstart", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [sfx]);

  const reduceMotion = useReducedMotion();
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const rouletteRef = useRef<number | null>(null);

  const ROLE_OPTIONS = useMemo(() => ["LOCAL", "SPY", "JOKER"] as const, []);
  const players = useMemo(() => Object.values(room.players ?? {}), [room.players]);

  const { totalVotesCounted, victimId, isTie, votesSorted, votesReceivedById } = useMemo(() => {
    const tally: Record<string, number> = {};
    let total = 0;

    for (const p of players) {
      if ((p as any).votedFor && !(p as any).isSilenced) {
        const v = (p as any).votedFor as string;
        tally[v] = (tally[v] || 0) + 1;
        total += 1;
      }
    }

    let max = 0;
    let victim: string | null = null;
    let tie = false;

    for (const [pid, count] of Object.entries(tally)) {
      if (count > max) {
        max = count;
        victim = pid;
        tie = false;
      } else if (count === max && count !== 0) {
        victim = null;
        tie = true;
      }
    }

    const sorted = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([pid, count]) => ({ pid, count }));

    const received: Record<string, number> = {};
    for (const { pid, count } of sorted) received[pid] = count;

    return { totalVotesCounted: total, victimId: victim, isTie: tie, votesSorted: sorted, votesReceivedById: received };
  }, [players]);

  const ejectedPlayer = useMemo(
    () => (victimId ? (room.players as any)[victimId] : null),
    [victimId, room.players]
  );

  const ejectedName = ejectedPlayer?.name ?? "NO ONE";
  const ejectedRole = ejectedPlayer?.role ?? null;

  const isSpyCaught = ejectedRole === "SPY";
  const outcomeTone: "success" | "fail" | "neutral" = !ejectedPlayer ? "neutral" : isSpyCaught ? "success" : "fail";

  // Avoid restarting the cinematic timeline on every room object update.
  // Only restart when the key result inputs change.
  const roomCode = (room as any).code ?? (room as any).id ?? "";
  const roomWinner = (room as any).winner ?? "";
  const timelineKey = `${roomCode}|${victimId ?? ""}|${roomWinner}`;


  // IMPORTANT: NO GREEN BEFORE STAGE 4.
  const tone = useMemo(() => {
    if (outcomeTone === "success")
      return {
        cls: "text-violet-200",
        border: "border-violet-400/35",
        bg: "bg-violet-500/10",
        glow: "rgba(139,92,246,0.50)",
        flash: "radial-gradient(circle at center, rgba(139,92,246,0.24), rgba(0,0,0,0) 62%)",
        bar: "bg-violet-400/80",
      };
    if (outcomeTone === "fail")
      return {
        cls: "text-rose-200",
        border: "border-rose-400/35",
        bg: "bg-rose-500/10",
        glow: "rgba(244,63,94,0.40)",
        flash: "radial-gradient(circle at center, rgba(244,63,94,0.20), rgba(0,0,0,0) 62%)",
        bar: "bg-rose-400/70",
      };
    return {
      cls: "text-slate-200",
      border: "border-white/10",
      bg: "bg-white/[0.03]",
      glow: "rgba(139,92,246,0.26)",
      flash: "radial-gradient(circle at center, rgba(139,92,246,0.16), rgba(0,0,0,0) 62%)",
      bar: "bg-violet-400/80",
    };
  }, [outcomeTone]);

  const winnerColor =
    room.winner === "LOCALS" ? "text-emerald-400" : room.winner === "JOKER" ? "text-fuchsia-400" : "text-rose-400";
  const winnerTitle = room.winner === "LOCALS" ? "VICTORY" : room.winner === "JOKER" ? "JOKER WINS" : "DEFEAT";

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (rouletteRef.current) window.clearInterval(rouletteRef.current);
    rouletteRef.current = null;
  }, []);

  const jumpToReport = useCallback(() => {
    clearAllTimers();
    sfx.stopSuspense();
    setDecryptProgress(1);
    setCanAdvance(true);
    setStage(4);
  }, [clearAllTimers, sfx]);

  const advance = useCallback(() => {
    if (stage === 2) sfx.stopSuspense();

    // init audio on first user gesture
    if (!hasInitializedAudio.current) {
      void sfx.init();
      hasInitializedAudio.current = true;
    }

    setStage((s) => (s >= 4 ? 4 : s + 1));
  }, [stage, sfx]);

  // --- AUDIO TRIGGERS ---

  // 1) Suspense drone on Stage 2
  useEffect(() => {
    if (stage === 2 && ejectedPlayer) sfx.startSuspense();
    else sfx.stopSuspense();
  }, [stage, ejectedPlayer, sfx]);

  // 2) Impact boom on Stage 3
  useEffect(() => {
    if (stage === 3) sfx.playImpact(outcomeTone);
  }, [stage, sfx, outcomeTone]);

  // Auto timeline (Stage 2 is longer now)
  useEffect(() => {
    clearAllTimers();
    setStage(0);
    setDecryptProgress(0);
    setCanAdvance(false);
    setRouletteIndex(0);

    // audio is unlocked on first user gesture (see effect above)

    const D = reduceMotion
      ? { takeover: 800, verdict: 1100, decrypt: 950, truth: 900 }
      : { takeover: 2600, verdict: 4200, decrypt: 7600, truth: 5200 }; // <-- longer decrypt stage

    const schedule = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    schedule(D.takeover, () => setStage(1));
    schedule(D.takeover + D.verdict, () => setStage(2));
    schedule(D.takeover + D.verdict + D.decrypt, () => setStage(3));
    schedule(D.takeover + D.verdict + D.decrypt + D.truth, () => setStage(4));

    return () => {
      clearAllTimers();
      sfx.stopSuspense();
    };
  }, [clearAllTimers, reduceMotion, timelineKey, sfx]);

  // Stage 2 decrypt progress (align with longer decrypt)
  useEffect(() => {
    if (stage !== 2 || !ejectedPlayer) {
      setDecryptProgress(stage >= 3 ? 1 : 0);
      return;
    }

    setCanAdvance(false);
    setDecryptProgress(0);

    const start = performance.now();
    const duration = reduceMotion ? 650 : 7000; // <-- longer suspense fill

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDecryptProgress(eased);

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setCanAdvance(true);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [stage, ejectedPlayer, reduceMotion]);

  // Stage 2 roulette (+ tick sound)
  useEffect(() => {
    if (stage !== 2 || !ejectedPlayer) {
      if (rouletteRef.current) window.clearInterval(rouletteRef.current);
      rouletteRef.current = null;
      return;
    }

    if (rouletteRef.current) window.clearInterval(rouletteRef.current);

    const tickRoulette = () => {
      setRouletteIndex((i) => (i + 1) % ROLE_OPTIONS.length);
      sfx.playTick();
    };

    let ms = reduceMotion ? 140 : 95;
    rouletteRef.current = window.setInterval(tickRoulette, ms);

    const slowTick = window.setInterval(() => {
      if (!rouletteRef.current) return;
      const p = decryptProgress;
      const target = reduceMotion ? 200 : p > 0.9 ? 230 : p > 0.72 ? 150 : 95;

      if (target !== ms) {
        ms = target;
        window.clearInterval(rouletteRef.current);
        rouletteRef.current = window.setInterval(tickRoulette, ms);
      }
    }, 140);

    return () => {
      if (rouletteRef.current) window.clearInterval(rouletteRef.current);
      rouletteRef.current = null;
      window.clearInterval(slowTick);
    };
  }, [stage, ejectedPlayer, decryptProgress, reduceMotion, ROLE_OPTIONS.length, sfx]);

  // Input handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return jumpToReport();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) return jumpToReport();
        if (stage === 2 && ejectedPlayer && !canAdvance) return;
        advance();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, jumpToReport, stage, ejectedPlayer, canAdvance]);

  const onOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("button")) return;
      if (e.shiftKey) return jumpToReport();
      if (stage === 2 && ejectedPlayer && !canAdvance) return;
      advance();
    },
    [advance, jumpToReport, stage, ejectedPlayer, canAdvance]
  );

  // Constant-length redaction (never hints "SPY" length)
  const redactionTape = useMemo(() => {
    if (stage !== 2 || !ejectedPlayer) return "";
    const glyphs = "█▓▒░";
    const marks = "#@%&?";
    const len = 18;
    const p = decryptProgress;

    const chaos = Math.max(0.18, 1 - p);
    let s = "";
    for (let i = 0; i < len; i++) {
      const r = Math.random();
      if (r < chaos) s += glyphs[Math.floor(Math.random() * glyphs.length)];
      else if (r < chaos + 0.20) s += marks[Math.floor(Math.random() * marks.length)];
      else s += "█";
    }
    if (p > 0.92) s = "██▌██████▌██████▌██".slice(0, len);
    return s;
  }, [stage, ejectedPlayer, decryptProgress]);

  const scoreboard = useMemo(() => {
    const list = [...players].map((p: any) => ({
      ...p,
      _score: Number.isFinite(p.score) ? p.score : 0,
      _votes: votesReceivedById[p.id] || 0,
    }));
    list.sort((a, b) => {
      if (victimId && a.id === victimId && b.id !== victimId) return -1;
      if (victimId && b.id === victimId && a.id !== victimId) return 1;
      if (b._score !== a._score) return b._score - a._score;
      if (b._votes !== a._votes) return b._votes - a._votes;
      return String(a.name).localeCompare(String(b.name));
    });
    return list;
  }, [players, victimId, votesReceivedById]);

  // Visual assets
  const vignette = (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85),rgba(0,0,0,0.15),rgba(0,0,0,0.9))]" />
    </div>
  );

  const grid = (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,70,239,0.10),transparent_55%)]" />
    </div>
  );

  const scanline = (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-24 opacity-35"
      initial={{ y: "-20%" }}
      animate={{ y: ["-20%", "120%"], opacity: [0.1, 0.35, 0.15] }}
      transition={{ duration: reduceMotion ? 1.6 : 2.4, ease: "linear", repeat: Infinity }}
      style={{
        background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(139,92,246,0.22), rgba(255,255,255,0))",
        filter: "blur(2px)",
      }}
    />
  );

  return (
    <div
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 font-mono text-white overflow-hidden flex flex-col select-none"
    >
      {grid}
      {vignette}
      {scanline}

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
        animate={{ opacity: reduceMotion ? 0.06 : [0.06, 0.12, 0.08, 0.14, 0.07] }}
        transition={{ duration: reduceMotion ? 2 : 3.5, repeat: Infinity }}
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* IMPORTANT: removing mode="wait" eliminates the “gap” where you’d still see the redaction frame. */}
      <AnimatePresence mode="sync">
        {/* STAGE 0 — TAKEOVER */}
        {stage === 0 && (
          <motion.div
            key="takeover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: "blur(14px)", transition: { duration: 0.18 } }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center"
          >
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="text-[11px] uppercase tracking-[0.6em] text-violet-300/80"
            >
              SYSTEM OVERRIDE
            </motion.p>
            <motion.h2
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="mt-4 text-4xl md:text-7xl font-black tracking-tighter uppercase"
            >
              WITNESS
              <span className="block text-white/70">THE VERDICT</span>
            </motion.h2>
            <motion.div
              className="mt-10 w-full max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-slate-400">
                <span>Parsing Votes</span>
                <span className="text-violet-300/80">{Math.min(100, 18 + Math.floor(Math.random() * 12))}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-violet-400/80"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: reduceMotion ? 0.6 : 2.0, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-4 text-xs text-slate-400/80 tracking-widest">
                {totalVotesCounted}/{players.length} votes received.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 1 — VERDICT */}
        {stage === 1 && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(14px)", transition: { duration: 0.18 } }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 md:p-10 text-center"
          >
            <p className="text-slate-400 uppercase tracking-[0.6em] text-[11px]">CITY COUNCIL DECISION</p>
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-8 relative"
            >
              <motion.div
                className="absolute -inset-12 rounded-full border border-rose-500/25"
                animate={{ rotate: 360 }}
                transition={{ duration: reduceMotion ? 8 : 14, ease: "linear", repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-6 rounded-full border-2 border-rose-500/60"
                animate={{ opacity: [0.35, 0.9, 0.45] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_0_34px_rgba(225,29,72,0.45)]">
                {ejectedPlayer ? ejectedName : "NO ONE"}
              </h1>
              <div className="mt-7 inline-flex items-center gap-3">
                <span className="bg-rose-600 text-white px-4 py-1 text-[11px] font-black uppercase tracking-[0.35em]">
                  {ejectedPlayer ? "MARKED" : "UNRESOLVED"}
                </span>
                <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                  {isTie ? "Tie Vote" : ejectedPlayer ? "Ejection Ordered" : "No Majority"}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="mt-10 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-slate-400">
                <span>Vote Breakdown</span>
                <span className="text-slate-300">{totalVotesCounted} counted</span>
              </div>
              <div className="mt-4 space-y-2">
                {votesSorted.length === 0 && (
                  <div className="text-slate-500 text-xs uppercase tracking-widest py-6">No votes were cast.</div>
                )}
                {votesSorted.slice(0, 4).map(({ pid, count }, i) => {
                  const p = (room.players as any)[pid];
                  const name = p?.name ?? "UNKNOWN";
                  const pct = totalVotesCounted ? Math.round((count / totalVotesCounted) * 100) : 0;
                  return (
                    <motion.div
                      key={`${pid}-${i}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.06 * i }}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-white/90">{name}</span>
                          {pid === victimId && (
                            <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">
                              top
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.42em] text-slate-400">
                          {count} ({pct}%)
                        </div>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full bg-violet-400/70"
                          initial={{ width: "0%" }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 2 — DECRYPT (LONGER + SHAKES THE WHOLE TIME) */}
        {stage === 2 && (
          <motion.div
            key="decrypt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.08 }, // <-- near-instant exit so Stage 3 isn't delayed by old frame
            }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center"
          >
            <p className="text-slate-400 text-[11px] uppercase tracking-[0.6em]">SECURE FILE ACCESS</p>

            {/* This is the “camera jitter” you asked to last longer */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={
                reduceMotion
                  ? { scale: 1, opacity: 1 }
                  : {
                      scale: 1,
                      opacity: 1,
                      x: [0, -2, 2, -1.5, 1.5, -1, 1, 0],
                      y: [0, 1, -1, 0.5, -0.5, 0],
                      rotate: [0, -0.14, 0.14, -0.1, 0.1, 0],
                    }
              }
              transition={
                reduceMotion
                  ? { delay: 0.1 }
                  : { duration: 2.2, repeat: Infinity, ease: "easeInOut" } // <-- longer shake loop
              }
              className="mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 relative overflow-hidden"
            >
              <motion.div
                className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-2 border-violet-400/30"
                animate={{ rotate: 360 }}
                transition={{ duration: reduceMotion ? 10 : 18, ease: "linear", repeat: Infinity }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.16),transparent_55%)]" />

              {!ejectedPlayer ? (
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-500">NO EXTRACTION</h2>
                  <p className="mt-4 text-slate-400/80 uppercase tracking-widest text-sm">The city holds its breath. The night continues.</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.42em] text-slate-400">Subject</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.42em] text-white/80">{ejectedName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] uppercase tracking-[0.42em] text-slate-400">Status</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.42em] text-violet-300/80">declassifying</span>
                  </div>

                  <div className="mt-8 text-slate-400 text-xs uppercase tracking-[0.42em]">True Allegiance</div>

                  <motion.div
                    className="mt-5 text-4xl md:text-7xl font-black uppercase tracking-[0.22em] text-white/20"
                    animate={reduceMotion ? {} : { x: [0, -1, 1, 0], opacity: [1, 0.9, 1] }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 18px rgba(139,92,246,0.18))" }}
                  >
                    {redactionTape}
                  </motion.div>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    {ROLE_OPTIONS.map((r, idx) => {
                      const active = idx === rouletteIndex;
                      return (
                        <motion.div
                          key={r}
                          className={`px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-[0.25em] ${
                            active ? "border-violet-400/45 bg-violet-500/10 text-white/80" : "border-white/10 bg-white/[0.02] text-white/35"
                          }`}
                          animate={active && !reduceMotion ? { y: [0, -2, 0], opacity: [0.85, 1, 0.85] } : {}}
                          transition={{ duration: 0.6, repeat: active ? Infinity : 0 }}
                          style={{ filter: "blur(0.6px)" }}
                        >
                          {r}
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="mt-5 text-[11px] uppercase tracking-[0.5em] text-slate-500">Decide. Then watch the truth hit.</p>

                  <div className="mt-10">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-slate-400">
                      <span>Decrypting</span>
                      <span className="text-violet-300/80">{Math.round(decryptProgress * 100)}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full bg-violet-400/80"
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.round(decryptProgress * 100)}%` }}
                        transition={{ duration: 0.15, ease: "linear" }}
                      />
                    </div>
                    <p className="mt-5 text-[11px] uppercase tracking-[0.42em] text-slate-500">
                      {canAdvance ? "FILE UNSEALED" : "DO NOT INTERRUPT"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* STAGE 3 — TRUTH (ROLE APPEARS IMMEDIATELY) */}
        {stage === 3 && (
          <motion.div
            key="truth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(14px)", transition: { duration: 0.18 } }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center"
          >
            {!reduceMotion && ejectedPlayer && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.65, 0] }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{ background: tone.flash }}
              />
            )}

            {!ejectedPlayer ? (
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.6em] text-slate-400">RESULT</p>
                <h2 className="mt-5 text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-200/80">NO ONE FALLS.</h2>
                <p className="mt-5 text-slate-400/80 uppercase tracking-widest text-sm">A silent stalemate. The city survives—barely.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl">
                <p className="text-[11px] uppercase tracking-[0.6em] text-slate-400">CLEARANCE GRANTED</p>

                <div className="mt-7">
                  {/* No placeholder. No delay. Role hits immediately. */}
                  <motion.div
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 13, stiffness: 190 }}
                  >
                    <h1
                      className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white"
                      style={{ textShadow: `0 0 54px ${tone.glow}` }}
                    >
                      {ejectedRole}
                    </h1>
                    <div className="mt-5 flex justify-center">
                      <div
                        className="h-[3px] w-44 rounded-full"
                        style={{
                          background: `linear-gradient(to right, rgba(0,0,0,0), ${tone.glow}, rgba(0,0,0,0))`,
                          filter: "blur(0.2px)",
                        }}
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-10 flex flex-col items-center gap-4"
                >
                  <div className={`w-full max-w-2xl rounded-2xl border p-6 md:p-7 ${tone.border} ${tone.bg}`}>
                    <p className={`text-2xl md:text-3xl font-black uppercase tracking-widest ${tone.cls}`}>
                      {isSpyCaught ? "TARGET CONFIRMED" : "WRONG BODY"}
                    </p>
                    <p className="mt-3 text-sm md:text-base text-white/75">
                      {isSpyCaught
                        ? "You dragged the parasite into the light. The city breathes again."
                        : `You executed a ${String(ejectedRole)}. The real SPY is still out there.`}
                    </p>
                    <div className="mt-5 text-[11px] uppercase tracking-[0.42em] text-white/55">
                      Subject: <span className="text-white/80 font-black">{ejectedName}</span>
                      <span className="mx-2 text-white/25">•</span>
                      Votes: <span className="text-white/80 font-black">{votesReceivedById[victimId ?? ""] || 0}</span>
                      <span className="mx-2 text-white/25">•</span>
                      Verdict: <span className="text-white/80 font-black">executed</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STAGE 4 — REPORT (GREEN IS ALLOWED HERE) */}
        {stage === 4 && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-slate-950 flex flex-col">
            <div
              className={`p-7 md:p-8 pb-5 border-b border-slate-800 ${
                room.winner === "LOCALS" ? "bg-emerald-900/20" : room.winner === "JOKER" ? "bg-fuchsia-900/20" : "bg-rose-900/20"
              }`}
            >
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.5em] mb-2">FINAL REPORT</p>
              <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${winnerColor}`}>{winnerTitle}</h1>
              <p className="text-sm opacity-70 mt-2 max-w-2xl">
                {room.winner === "LOCALS"
                  ? "The infiltration failed. The city survives."
                  : room.winner === "JOKER"
                  ? "Chaos wins. Nobody played it straight."
                  : "The infiltration succeeds. Trust is dead."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest text-slate-300/80">
                  Votes counted: <span className="text-white/80 font-black">{totalVotesCounted}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] uppercase tracking-widest text-slate-300/80">
                  Outcome: <span className="text-white/80 font-black">{ejectedPlayer ? `Ejected ${ejectedName}` : "No ejection"}</span>
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {scoreboard.map((p: any, i: number) => {
                const isEjected = victimId && p.id === victimId;
                const roleCls = p.role === "SPY" ? "text-rose-400" : p.role === "LOCAL" ? "text-emerald-400" : "text-amber-300";

                return (
                  <motion.div
                    key={p.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: Math.min(0.5, i * 0.05) }}
                    className={`flex items-center justify-between gap-4 p-5 md:p-6 border-b border-slate-900 hover:bg-white/[0.04] transition-colors ${
                      isEjected ? "bg-rose-500/10" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg md:text-xl font-black uppercase truncate">{p.name}</span>
                        {isEjected && (
                          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">
                            Ejected
                          </span>
                        )}
                        {(p as any).isSilenced && (
                          <span className="text-[10px] bg-slate-700 text-white/90 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                            Silenced
                          </span>
                        )}
                        {(p as any)._votes > 0 && (
                          <span className="text-[10px] border border-white/10 bg-white/[0.03] px-2 py-0.5 rounded font-black uppercase tracking-widest text-slate-300">
                            {p._votes} votes
                          </span>
                        )}
                        {Number.isFinite((p as any)._score) && (
                          <span className="text-[10px] border border-white/10 bg-white/[0.03] px-2 py-0.5 rounded font-black uppercase tracking-widest text-slate-300">
                            {(p as any)._score} pts
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 uppercase tracking-widest">
                        Code: <span className="text-slate-200/80">{p.secretWord ?? "—"}</span>
                      </div>
                    </div>

                    <div className={`shrink-0 text-sm md:text-base font-black uppercase tracking-widest ${roleCls}`}>{p.role}</div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/70 backdrop-blur">
              <button
                onClick={onReturnToLobby}
                className="w-full py-5 bg-white text-black hover:bg-violet-400 transition-colors font-black uppercase tracking-[0.22em] text-sm"
              >
                INITIALIZE NEW GAMES
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
