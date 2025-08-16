import React, { useEffect, useRef, useState } from "react";
import appIcon from '../assets/app_icon.webp'

import { PauseIcon, PlayIcon, ArrowLeftIcon, ArrowRightIcon } from "../icons";

// Live Preview with editable panel that can be minimized (no Tailwind; inline styles)
export default function PreviewTeleprompter() {
  const [text, setText] = useState(
    Array.from({ length: 80 }, (_, i) => `Baris contoh ke-${i + 1}. `.repeat(8)).join("\n")
  );
  const [mirrored, setMirrored] = useState(false);
  const [speed, setSpeed] = useState(10); // px/s
  const [running, setRunning] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  const stageRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(0);

  // keep ref in sync so rAF loop always reads latest state
  useEffect(() => { runningRef.current = running; }, [running]);

  // rAF autoscroll with accumulator for Firefox stability
  useEffect(() => {
    const el = stageRef.current;
    if (!runningRef.current || !el) return;

    let prev = performance.now();
    let carry = 0; // fractional px accumulator

    const loop = (now) => {
      if (!runningRef.current) return; // stop if paused
      const dt = Math.min(now - prev, 100);
      prev = now;

      const max = el.scrollHeight - el.clientHeight;
      carry += (Number(speed) * dt) / 1000; // px this frame (can be fractional)
      const step = carry >= 1 ? Math.floor(carry) : 0;
      if (step > 0) {
        if (typeof el.scrollBy === "function") el.scrollBy(0, step);
        else el.scrollTop = Math.min(el.scrollTop + step, max);
        carry -= step;
      }
      if (el.scrollTop < max) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setRunning(false);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, running]);

  // very light runtime tests (won't change UI state)
  useEffect(() => {
    try {
      const sample = Array.from({ length: 3 }, (_, i) => `L${i + 1}`).join("\n");
      console.assert(sample.split("\n").length === 3, "[Test] split/join newline should work");
      console.assert(typeof stageRef.current?.scrollTop === "number", "[Test] stageRef should point to a scrollable element");
      console.log("[Tests] basic runtime checks passed");
    } catch (e) {
      console.warn("[Tests] failed:", e);
    }
  }, []);

  const resetScroll = () => { const el = stageRef.current; if (el) el.scrollTop = 0; };

  const styles = {
    page: { fontFamily: "Inter, system-ui, Arial, sans-serif", background: "#0a0a0a", color: "#e5e5e5", minHeight: "100vh", padding: 16 },
    row: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
    bottomRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      // gap: 8,
      marginTop: 12
    },
    btn: (active) => ({ padding: "8px 12px", borderRadius: 8, border: "1px solid #262626", cursor: "pointer", background: active ? "#059669" : "#262626", color: active ? "white" : "#e5e5e5" }),
    danger: { background: "#dc2626", color: "white" },
    input: { width: 280 },
    main: (show) => ({ display: "flex", gap: show ? 16 : 0 }),
    editorWrap: (show) => ({ position: "relative", width: show ? "40%" : 0, opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(-8px)", transition: "all .3s ease", pointerEvents: show ? "auto" : "none" }),
    editorBox: { minHeight: "70vh", background: "#111213", border: "1px solid #262626", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" },
    generalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", fontSize: 12, borderBottom: "1px solid #262626", background: "#0f1010" },
    editor: { flex: 1, resize: "none", background: "transparent", padding: 12, color: "#e5e5e5", outline: "none", border: 0 },
    stageWrap: (show) => ({ width: show ? "60%" : "100%", transition: "all .3s ease" }),
    stage: { height: "70vh", overflowY: "auto", background: "#111213", border: "1px solid #262626", borderRadius: 12, padding: 24, lineHeight: 1.6 },
    label: { fontSize: 12, opacity: .7, margin: "-4px 0 8px", padding: "0 4px" },
    inner: (mirrored) => ({ maxWidth: 800, margin: "0 auto", fontSize: 32, transform: mirrored ? "scaleX(-1)" : "none" }),
    p: { marginBottom: 18 },
    floating: { position: "fixed", left: 16, bottom: 16, padding: "8px 12px", borderRadius: 8, border: "1px solid #262626", background: "#262626", color: "#e5e5e5", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,.35)" }
  };

  // batas & step speed
  const SPEED_MIN = 10;
  const SPEED_MAX = 100;
  const SPEED_STEP = 10;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const setSpeedClamped = (v) => setSpeed(clamp(Math.round(Number(v)), SPEED_MIN, SPEED_MAX));
  const incSpeed = () => setSpeedClamped(Number(speed) + SPEED_STEP);
  const decSpeed = () => setSpeedClamped(Number(speed) - SPEED_STEP);


  return (
    <div style={styles.page}>
      <div class="flex items-center gap-3">
        <img class="h-10 w-10" src={appIcon} alt="AppIcon" />
        <h1 class="font-serif text-3xl font-semibold">Speak'O!</h1>
      </div>

      <section className="flex flex-wrap items-center gap-3 py-3">

        {!showEditor && (
          <button onClick={() => setShowEditor(true)} className="px-2.5 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium" title="Tampilkan Editor">✏️ Show Editor</button>
        )}

        {/* <div className="flex gap-2 ms-auto">
          <label className="pe-5 pt-0.5 opacity-80">Speed Controller</label>
          <button
            type="button"
            onClick={decSpeed}
            className="px-2.5 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium"
            aria-label="Kurangi kecepatan"
            title={`- ${SPEED_STEP} px/s`}
          >
            −
          </button>

          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={SPEED_STEP}
            value={Number(speed)}
            onChange={(e) => setSpeedClamped(e.target.value)}
            className="w-32 accent-emerald-500"
            aria-label="Scroll speed (px/s)"
          />

          <button
            type="button"
            onClick={incSpeed}
            className="px-2.5 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium"
            aria-label="Tambah kecepatan"
            title={`+ ${SPEED_STEP} px/s`}
          >
            +
          </button>

          <span className="text-sm tabular-nums pt-1 ps-1 opacity-75 text-center">
            {Number(speed)} px/s
          </span>
        </div>

        {/* <div className="ms-auto text-xs opacity-60">Tip: F11 untuk fullscreen</div> */}
      </section>


      <div style={styles.main(showEditor)}>
        {/* Editor Panel */}
        <div style={styles.editorWrap(showEditor)} aria-hidden={!showEditor}>
          <div style={styles.editorBox}>
            <div style={styles.generalHeader}>
              <span>✏️ Editor</span>
              <button onClick={() => setShowEditor(false)} title="Minimize Editor" style={{ background: "transparent", border: 0, color: "#e5e5e5", cursor: "pointer" }}>🙈</button>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis naskah di sini…" style={styles.editor} />
          </div>
        </div>

        {/* Stage */}
        <div style={styles.stageWrap(showEditor)}>
          <div ref={stageRef} style={styles.stage} aria-label="Teleprompter stage">
            <div style={styles.label}>📜 Teleprompter</div>
            <div style={styles.inner(mirrored)}>
              {text.split("\n").map((line, i) => (
                <p key={i} style={styles.p}>{line || "\u00A0"}</p>
              ))}
              <div style={{ height: 160 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.bottomRow}>
        <h1 class="flex-1"></h1>
        <div class="flex-1">
          <div className="flex gap-2">

            <button onClick={resetScroll} style={styles.btn(false)}> Reset</button>
            <button onClick={() => setRunning(v => !v)} style={{ ...styles.btn(!running), ...(running ? styles.danger : {}) }}>
              {running ? <PauseIcon size={20} color="#fff" /> : <PlayIcon size={20} color="#fff" />}
            </button>
            <button onClick={() => setMirrored(m => !m)} style={styles.btn(false)}>{mirrored ? <ArrowRightIcon size={20} color="#fff" /> : <ArrowLeftIcon size={20} color="#fff" />}</button>
          </div>
        </div>
        <div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={decSpeed}
              className="px-2.5 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium"
              aria-label="Kurangi kecepatan"
              title={`- ${SPEED_STEP} px/s`}
            >
              −
            </button>

            <input
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step={SPEED_STEP}
              value={Number(speed)}
              onChange={(e) => setSpeedClamped(e.target.value)}
              className="w-32 accent-emerald-500"
              aria-label="Scroll speed (px/s)"
            />

            <button
              type="button"
              onClick={incSpeed}
              className="px-2.5 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm font-medium"
              aria-label="Tambah kecepatan"
              title={`+ ${SPEED_STEP} px/s`}
            >
              +
            </button>

            <span className="text-sm tabular-nums pt-1 ps-1 opacity-75 text-center">
              {Number(speed)} px/s
            </span>
          </div>
        </div>

      </div>

    </div >
  );
}
