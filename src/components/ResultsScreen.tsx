// src/components/ResultsScreen.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Room } from "../types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface ResultsScreenProps {
  room: Room;
  playerId: string; // <--- NEW
  onReturnToLobby: () => void;
  onStartNextRound: () => void; // <--- NEW
}

/**
 * Mafia-style cinematic reveal (NO GREEN before final report).
 * - Click / Space / Enter: advance
 * - Shift+Click or Shift+Space: skip to report
 * - Esc: skip to report
 */

const ROLE_OPTIONS = ["LOCAL", "SPY", "JOKER"] as const;

const STAGES = {
  TAKEOVER: 0,
  VERDICT: 1,
  DECRYPT: 2,
  TRUTH: 3,
  REPORT: 4,
} as const;

type Stage = (typeof STAGES)[keyof typeof STAGES];

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ room, playerId, onReturnToLobby, onStartNextRound }) => {
  const [stage, setStage] = useState<Stage>(STAGES.TAKEOVER);

  const me = (room as any).players?.[playerId] ?? (room as any).players?.[String(playerId)];

  if (!me) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 font-mono text-white flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-rose-500">PLAYER NOT FOUND</h1>
          <p className="mt-2 text-xs text-slate-500 uppercase tracking-wider">Missing playerId in room.players</p>
        </div>
      </div>
    );
  }


  // Stage 2 decrypt + suspense
  const [decryptProgress, setDecryptProgress] = useState<number>(0);
  const [canAdvance, setCanAdvance] = useState<boolean>(false);

  // Stage 2 roulette (keeps it guessy; never hints real length)
  const [rouletteIndex, setRouletteIndex] = useState<number>(0);

  const reduceMotion = useReducedMotion();

  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const rouletteRef = useRef<number | null>(null);
  const rouletteSlowRef = useRef<number | null>(null);

  // Ref to avoid re-creating roulette intervals every frame
  const decryptProgressRef = useRef<number>(0);
  useEffect(() => {
    decryptProgressRef.current = decryptProgress;
  }, [decryptProgress]);

  const players = useMemo(() => Object.values((room as any).players ?? {}), [room]);

  const { totalVotesCounted, victimId, isTie, votesSorted, votesReceivedById } = useMemo(() => {
    const tally: Record<string, number> = {};
    let total = 0;

    for (const p of players as any[]) {
      if (p?.votedFor && !p?.isSilenced && !p?.isEliminated) {
        const v = String(p.votedFor);
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

    return {
      totalVotesCounted: total,
      victimId: victim,
      isTie: tie,
      votesSorted: sorted,
      votesReceivedById: received,
    };
  }, [players]);

  const ejectedPlayer = useMemo(() => {
    if (!victimId) return null;
    const map = (room as any).players ?? {};
    return map[victimId] ?? null;
  }, [victimId, room]);

  const ejectedName = ejectedPlayer?.name ?? "NO ONE";
  const ejectedRole = ejectedPlayer?.role ?? null;

  const isSpyCaught = ejectedRole === "SPY";
  const outcomeTone: "success" | "fail" | "neutral" = !ejectedPlayer ? "neutral" : isSpyCaught ? "success" : "fail";

  // IMPORTANT: Success is VIOLET (not green). Fail is ROSE.
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

  // Stage 4 (final report) is the ONLY place allowed to show green.
  const winner = (room as any).winner as 'LOCALS' | 'SPY' | 'JOKER' | null;
  
  // FIX: Don't check room.phase === "RESULTS" here, because this screen is now
  // sometimes shown as an overlay during the start of the Discussion phase.
  const isRoundOneEnd = !winner;

  // Personalized win/loss: what YOU see depends on your role + alive state.
  const myResult = useMemo(() => {
    if (!winner) return { title: "ROUND COMPLETE", color: "text-slate-200", isWin: false };

    // If you're dead, you lose (even if your faction wins).
    if (me?.isEliminated) return { title: "DEFEAT", color: "text-rose-500", isWin: false };

    const role = me?.role as any;

    if (winner === "LOCALS") {
      if (role === "LOCAL" || role === "TOURIST") return { title: "VICTORY", color: "text-emerald-400", isWin: true };
      return { title: "DEFEAT", color: "text-rose-500", isWin: false };
    }

    if (winner === "SPY") {
      // FIX: Green for Spy Victory
      if (role === "SPY") return { title: "VICTORY", color: "text-emerald-400", isWin: true };
      return { title: "DEFEAT", color: "text-rose-500", isWin: false };
    }

    if (winner === "JOKER") {
      // FIX: Green for Joker Victory
      if (role === "JOKER") return { title: "VICTORY", color: "text-emerald-400", isWin: true };
      return { title: "DEFEAT", color: "text-rose-500", isWin: false };
    }

    return { title: "GAME OVER", color: "text-slate-200", isWin: false };
  }, [winner, me]);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (rouletteRef.current) window.clearInterval(rouletteRef.current);
    rouletteRef.current = null;

    if (rouletteSlowRef.current) window.clearInterval(rouletteSlowRef.current);
    rouletteSlowRef.current = null;
  }, []);

  const jumpToReport = useCallback(() => {
    clearAllTimers();
    setDecryptProgress(1);
    setCanAdvance(true);
    setStage(STAGES.REPORT);
  }, [clearAllTimers]);

  const advance = useCallback(() => {
    setStage((s) => (s >= STAGES.REPORT ? STAGES.REPORT : ((s + 1) as Stage)));
  }, []);

  // Key the reveal timeline to a stable signature, not the entire `room` object
  const revealSig = useMemo(() => {
    return [
      victimId ?? "none",
      isTie ? "tie" : "no_tie",
      String(totalVotesCounted),
      String(ejectedRole ?? "none"),
      // FIX: Removed 'winner' so animation doesn't reset when phase changes to RESULTS
      String(players.length),
    ].join("|");
  }, [victimId, isTie, totalVotesCounted, ejectedRole, players.length]);

  // Auto timeline
  useEffect(() => {
    clearAllTimers();
    setStage(STAGES.TAKEOVER);
    setDecryptProgress(0);
    setCanAdvance(false);
    setRouletteIndex(0);

    const D = reduceMotion
      ? { takeover: 800, verdict: 1100, decrypt: 800, truth: 900 }
      : { takeover: 2600, verdict: 4200, decrypt: 6000, truth: 5200 };

    const schedule = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    schedule(D.takeover, () => setStage(STAGES.VERDICT));
    schedule(D.takeover + D.verdict, () => setStage(STAGES.DECRYPT));
    schedule(D.takeover + D.verdict + D.decrypt, () => setStage(STAGES.TRUTH));
    schedule(D.takeover + D.verdict + D.decrypt + D.truth, () => setStage(STAGES.REPORT));

    return () => clearAllTimers();
  }, [clearAllTimers, reduceMotion, revealSig]);

  // Stage 2 decrypt progress
  useEffect(() => {
    if (stage !== STAGES.DECRYPT || !ejectedPlayer) {
      setDecryptProgress(stage >= STAGES.TRUTH ? 1 : 0);
      return;
    }

    setCanAdvance(false);
    setDecryptProgress(0);

    const start = performance.now();
    const duration = reduceMotion ? 650 : 5400;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDecryptProgress(eased);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCanAdvance(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [stage, ejectedPlayer, reduceMotion]);

  // Stage 2 roulette: interval stable; reads decrypt progress via ref
  useEffect(() => {
    if (stage !== STAGES.DECRYPT || !ejectedPlayer) {
      if (rouletteRef.current) window.clearInterval(rouletteRef.current);
      rouletteRef.current = null;
      if (rouletteSlowRef.current) window.clearInterval(rouletteSlowRef.current);
      rouletteSlowRef.current = null;
      return;
    }

    if (rouletteRef.current) window.clearInterval(rouletteRef.current);
    if (rouletteSlowRef.current) window.clearInterval(rouletteSlowRef.current);

    let ms = reduceMotion ? 140 : 95;

    const setRoulette = (intervalMs: number) => {
      if (rouletteRef.current) window.clearInterval(rouletteRef.current);
      rouletteRef.current = window.setInterval(() => {
        setRouletteIndex((i) => (i + 1) % ROLE_OPTIONS.length);
      }, intervalMs);
    };

    setRoulette(ms);

    rouletteSlowRef.current = window.setInterval(() => {
      const p = decryptProgressRef.current;
      const target = reduceMotion ? 200 : p > 0.85 ? 210 : p > 0.65 ? 140 : 95;

      if (target !== ms) {
        ms = target;
        setRoulette(ms);
      }
    }, 140);

    return () => {
      if (rouletteRef.current) window.clearInterval(rouletteRef.current);
      rouletteRef.current = null;
      if (rouletteSlowRef.current) window.clearInterval(rouletteSlowRef.current);
      rouletteSlowRef.current = null;
    };
  }, [stage, ejectedPlayer, reduceMotion]);

  // Input handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return jumpToReport();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) return jumpToReport();
        if (stage === STAGES.DECRYPT && ejectedPlayer && !canAdvance) return;
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
      if (stage === STAGES.DECRYPT && ejectedPlayer && !canAdvance) return;
      advance();
    },
    [advance, jumpToReport, stage, ejectedPlayer, canAdvance]
  );

  // Stage 2: fixed-length redaction (NEVER hints role length)
  const redactionTape = useMemo(() => {
    if (stage !== STAGES.DECRYPT || !ejectedPlayer) return "";
    const glyphs = "█▓▒░";
    const marks = "#@%&?";
    const len = 18; // constant
    const p = decryptProgress;

    const chaos = Math.max(0.18, 1 - p);
    let s = "";
    for (let i = 0; i < len; i++) {
      const r = Math.random();
      if (r < chaos) s += glyphs[Math.floor(Math.random() * glyphs.length)];
      else if (r < chaos + 0.2) s += marks[Math.floor(Math.random() * marks.length)];
      else s += "█";
    }

    if (p > 0.92) s = "██▌██████▌██████▌██".slice(0, len);
    return s;
  }, [stage, ejectedPlayer, decryptProgress]);

  const scoreboard = useMemo(() => {
    const list = [...(players as any[])].map((p) => ({
      ...p,
      _score: Number.isFinite(p?.score) ? p.score : 0,
      _votes: votesReceivedById[p?.id] || 0,
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
      // FIX: Changed h-screen to h-[100dvh] to prevent mobile browser bars from covering the bottom button
      className="fixed inset-0 z-50 w-screen h-[100dvh] bg-slate-950 font-mono text-white overflow-hidden flex flex-col select-none"
    >
      {grid}
      {vignette}
      {scanline}

      {/* soft noise */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
        animate={{ opacity: reduceMotion ? 0.06 : [0.06, 0.12, 0.08, 0.14, 0.07] }}
        transition={{ duration: reduceMotion ? 2 : 3.5, repeat: Infinity }}
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)",
        }}
      />

      <AnimatePresence mode="wait">
        {/* STAGE 0 — TAKEOVER */}
        {stage === STAGES.TAKEOVER && (
          <motion.div
            key="takeover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: "blur(14px)" }}
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
              // FIX: Smaller font on mobile (text-3xl)
              className="mt-4 text-3xl md:text-7xl font-black tracking-tighter uppercase"
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
        {stage === STAGES.VERDICT && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(14px)" }}
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

              {/* FIX: Smaller font on mobile, break-words to prevent overflow */}
              <h1 className="text-3xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_0_34px_rgba(225,29,72,0.45)] break-words px-2">
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
                  const p = ((room as any).players ?? {})[pid];
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

        {/* STAGE 2 — DECRYPT */}
        {stage === STAGES.DECRYPT && (
          <motion.div
            key="decrypt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center"
          >
            <p className="text-slate-400 text-[11px] uppercase tracking-[0.6em]">SECURE FILE ACCESS</p>

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
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
                    // FIX: Significantly smaller font on mobile for the long redaction string
                    className="mt-5 text-xl md:text-7xl font-black uppercase tracking-[0.1em] md:tracking-[0.22em] text-white/20 break-all"
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

        {/* STAGE 3 — TRUTH */}
        {stage === STAGES.TRUTH && (
          <motion.div
            key="truth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
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
                  <motion.div initial={{ scale: 1.18, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 13, stiffness: 190 }}>
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white" style={{ textShadow: `0 0 54px ${tone.glow}` }}>
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
                  transition={{ delay: 0.5 }}
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

        {/* STAGE 4 — REPORT */}
        {stage === STAGES.REPORT && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-slate-950 flex flex-col">
            <div
              className={`p-5 md:p-8 pb-5 border-b border-slate-800 ${
                winner === "LOCALS" ? "bg-emerald-900/20" : winner === "JOKER" ? "bg-fuchsia-900/20" : winner === "SPY" ? "bg-rose-900/20" : "bg-slate-900/40"
              }`}
            >
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.5em] mb-2">{isRoundOneEnd ? "INTERMEDIATE REPORT" : "FINAL REPORT"}</p>
              
              {/* FIX: ADDED CLEAR WINNER BANNER */}
              {winner && (
                <div className="mb-2">
                  <span className={`inline-block border-y-2 py-1 px-3 text-xs md:text-sm font-black uppercase tracking-[0.3em] ${
                    winner === 'SPY' ? 'border-rose-500/50 text-rose-400' : winner === 'LOCALS' ? 'border-emerald-500/50 text-emerald-400' : 'border-fuchsia-500/50 text-fuchsia-400'
                  }`}>
                    WINNER: {winner === 'LOCALS' ? 'CITIZENS' : winner}
                  </span>
                </div>
              )}

              {/* FIX: Responsive Text Size */}
              <h1 className={`text-3xl md:text-6xl font-black uppercase tracking-tighter ${winner ? myResult.color : 'text-slate-200'}`}>
                {winner ? myResult.title : 'ROUND COMPLETE'}
              </h1>
              <p className="text-xs md:text-sm opacity-70 mt-2 max-w-2xl">
                {winner === "LOCALS"
                  ? "The infiltration failed. The city survives."
                  : winner === "JOKER"
                  ? "Chaos wins. Nobody played it straight."
                  : winner === "SPY"
                  ? "The infiltration succeeds. Trust is dead."
                  : "Target eliminated. The threat remains. Prepare for the final vote."}
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
                const isDead = p.isEliminated;

                // FIX: Only show roles if Game Over, or if it's YOU, or if the player is Dead (revealed)
                const isRoleVisible = winner || p.id === me?.id || isDead;
                
                const roleText = isRoleVisible ? p.role : "HIDDEN";
                
                const roleCls = !isRoleVisible 
                  ? "text-slate-600"
                  : p.role === "SPY" ? "text-rose-500" : p.role === "LOCAL" ? "text-emerald-400" : "text-amber-300";

                return (
                  <motion.div
                    key={p.id}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: Math.min(0.5, i * 0.05) }}
                    className={`flex items-center justify-between gap-3 p-4 md:p-6 border-b border-slate-900 hover:bg-white/[0.04] transition-colors ${
                      isEjected ? "bg-rose-500/10" : isDead ? "bg-slate-900/80 grayscale opacity-60" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base md:text-xl font-black uppercase truncate ${isDead ? 'line-through decoration-rose-500/50 text-slate-500' : 'text-slate-200'}`}>
                          {p.name}
                        </span>

                        {/* FIX: Dead Icon & Ejected Badge */}
                        {isDead && (
                          <div className="flex items-center gap-2">
                             {!isEjected && (
                               <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1">
                                  DEAD
                               </span>
                             )}
                             {isEjected && (
                              <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                                EJECTED
                              </span>
                             )}
                          </div>
                        )}

                        {/* VISUAL INDICATOR FOR DEAD PLAYERS */}
                        {isDead && (
                          <div className="flex items-center gap-2">
                             {!isEjected && (
                               <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                  </svg>
                                  DEAD
                               </span>
                             )}
                             {isEjected && (
                              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">
                                EJECTED
                              </span>
                             )}
                          </div>
                        )}
                        {p?.isSilenced && (
                          <span className="text-[10px] bg-slate-700 text-white/90 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                            Silenced
                          </span>
                        )}
                        {p?._votes > 0 && (
                          <span className="text-[10px] border border-white/10 bg-white/[0.03] px-2 py-0.5 rounded font-black uppercase tracking-widest text-slate-300">
                            {p._votes} votes
                          </span>
                        )}
                        {Number.isFinite(p?._score) && (
                          <span className="text-[10px] border border-white/10 bg-white/[0.03] px-2 py-0.5 rounded font-black uppercase tracking-widest text-slate-300">
                            {p._score} pts
                          </span>
                        )}
                      </div>

                      <div className="mt-1 md:mt-2 text-[10px] md:text-xs text-slate-500 uppercase tracking-widest">
                         {/* FIX: Mask Secret Word */}
                        Code: <span className="text-slate-200/80">{isRoleVisible ? (p.secretWord ?? "—") : "••••"}</span>
                      </div>
                    </div>

                    <div className={`shrink-0 text-xs md:text-base font-black uppercase tracking-widest ${roleCls}`}>
                      {roleText}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/70 backdrop-blur">
              {winner ? (
                 <button
                   onClick={onReturnToLobby}
                   className="w-full py-5 bg-white text-black hover:bg-violet-400 transition-colors font-black uppercase tracking-[0.22em] text-sm"
                 >
                   INITIALIZE NEW GAME
                 </button>
              ) : (
                 me?.isEliminated ? (
                    <div className="w-full py-5 bg-slate-800 text-slate-500 font-black uppercase tracking-[0.22em] text-sm text-center border border-slate-700">
                       STATUS: TERMINATED // SPECTATING
                    </div>
                 ) : (
                    <button
                      onClick={onStartNextRound}
                      className="w-full py-5 bg-rose-600 text-white hover:bg-rose-500 transition-colors font-black uppercase tracking-[0.22em] text-sm animate-pulse"
                    >
                      PROCEED TO FINAL ROUND
                    </button>
                 )
              )}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};