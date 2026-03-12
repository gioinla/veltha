import { useState } from "react";

// ── Pre-loaded iMen content ──────────────────────────────────────────────────

const IMEN_VISION = `iMen — directed by Resmaa Menakem

Core concept: Black bodies whose ideas, labor, DNA, and cultural contributions were extracted and used for the benefit of humanity — without credit, without consent, without compensation. The science fiction premise makes visible what the real history already is: something sacred was taken, it powered civilization, and the source was erased.

Moral carrier (load-bearing — must survive every generation):
"a museum that should not exist" — or its moral equivalent.

What is preserved is still generative. The canisters do not trap. They preserve. That distinction is everything.

Creator framework (Resmaa Menakem — somatic abolitionist):
The body carries what history refuses to document. Trauma lives in tissue. So does genius. So does the record of what was taken. The canisters are somatic containers — the body as archive, as evidence, as source.

Emotional register that must coexist simultaneously:
grief + theft + brilliance + dignity

What it must never become: exploitative, horror-adjacent, spectacle.`;

const IMEN_PROJECT = `iMen — Shooting Script Material

THE CANISTER SCENE:
A single vertical glass canister, floor-to-ceiling, floating in deep black space. Inside, a Black man in his 40s stands upright, eyes open, still — not trapped, preserved. He wears ordinary clothes. His expression is dignified, unresolved. The glass is thick and slightly curved, refracting light. Warm amber and gold light radiates from inside — as if what is contained is still generative. Exterior: cold blue-black. IMAX scale. Specimen lighting.

VISUAL LANGUAGE:
- Warm amber/gold = interior of canisters = what is preserved = still generative
- Cold blue-black = exterior = the operation = the extractors
- The glass refracts — what is inside cannot be seen clearly, only approximated
- Scale is always IMAX — the weight of history requires that scale
- Motion is used carefully — only when it adds dignity, never spectacle

CHARACTERS:
Biz Bixby — Runs the operation. Colonial money, but not its origin. He is the executor, not the source. He inherited this. He didn't build it.

THE MATRIARCH (Biz's mother) — England family. Wheelchair. Oxygen tank. Watches on a screen while Biz runs the operation below. She IS the colonial money — aging, on life support, needing new genetic material to survive. Empire in a wheelchair watching its investment. Her presence reframes Biz entirely: he didn't build this, he inherited it. The colonial extraction is maternal.

DANTE — [⚠ FLAGGED: not in shooting draft. Appears in onboarding prompts as "Welcome, Dante." Do not generate Dante scenes until confirmed with Resmaa and Vincent. Identity unknown.]

THE FIVE FAMILIES SCENE:
Power structure meeting. The Matriarch's wheelchair presence reframes the entire scene — this isn't new money, this is old empire on life support.`;

const SEED_PROMPT = `A single vertical glass canister, floor-to-ceiling, floating in deep black space. Inside, a Black man in his 40s stands upright, eyes open, still — not trapped, preserved. He wears ordinary clothes. His expression is dignified, unresolved. The glass is thick and slightly curved, refracting light. A faint luminous energy radiates from inside the canister — warm amber and gold — as if what is contained is still generative. The exterior is cold blue-black. Cinematic. IMAX scale. No motion. Specimen lighting. The image should feel like a museum that should not exist.`;

const SEED_PARAMS = {
  atmosphere: "grief + theft + dignity",
  figure: "Black man, 40s, preserved not trapped",
  light: "warm amber interior / cold blue-black exterior",
  moral_carrier: "a museum that should not exist",
  scale: "IMAX cinematic",
  motion: "none — still",
};

// ── API call ─────────────────────────────────────────────────────────────────

async function evolvePrompt(currentPrompt, generation, vaultVision, vaultProject, blendValue) {
  const response = await fetch("/api/evolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPrompt, generation, vaultVision, vaultProject, blendValue }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || data.error || "Evolution failed");
    err.code = data.error;
    throw err;
  }
  return data;
}

// ── Blend slider label ────────────────────────────────────────────────────────

function blendLabel(val) {
  if (val === 0) return "Pure Script";
  if (val <= 20) return "Mostly Script";
  if (val <= 45) return "Script-Led";
  if (val <= 55) return "Equal Blend";
  if (val <= 75) return "World-Led";
  if (val <= 95) return "Mostly World";
  return "Pure World";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PromptOrganism() {
  const [generations, setGenerations] = useState([
    { id: 0, generation: 0, prompt: SEED_PROMPT, params: SEED_PARAMS, mutation: "Seed — origin DNA", status: "kept" },
  ]);
  const [current, setCurrent] = useState({
    id: 0, generation: 0, prompt: SEED_PROMPT, params: SEED_PARAMS, mutation: "Seed — origin DNA", status: "pending",
  });
  const [vaultVision, setVaultVision] = useState(IMEN_VISION);
  const [vaultProject, setVaultProject] = useState(IMEN_PROJECT);
  const [blendValue, setBlendValue] = useState(0);
  const [evolving, setEvolving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const [copied, setCopied] = useState(false);

  const kept = generations.filter((g) => g.status === "kept");
  const discarded = generations.filter((g) => g.status === "discarded");
  const nextGen = Math.max(...generations.map((g) => g.generation)) + 1;
  const isNewGeneration = !generations.find((g) => g.id === current.id);

  const handleEvolve = async () => {
    setEvolving(true);
    setError(null);
    try {
      const result = await evolvePrompt(current.prompt, current.generation, vaultVision, vaultProject, blendValue);
      setCurrent({ id: Date.now(), generation: nextGen, prompt: result.prompt, params: result.params, mutation: result.mutation, status: "pending" });
      setActiveTab("current");
    } catch (e) {
      setError(e.code === "INSUFFICIENT_CREDITS" ? e.message : `Evolution failed: ${e.message}`);
    }
    setEvolving(false);
  };

  const handleKeep = () => {
    const k = { ...current, status: "kept" };
    setGenerations((prev) => [...prev, k]);
    setCurrent(k);
  };

  const handleDiscard = () => {
    const d = { ...current, status: "discarded" };
    setGenerations((prev) => [...prev, d]);
    const lastKept = [...generations].reverse().find((g) => g.status === "kept");
    if (lastKept) setCurrent(lastKept);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // blend gradient: amber (script) → blue-grey (world)
  const blendGradient = `linear-gradient(to right, #c8a84a, #4a6a8a)`;

  return (
    <div style={{ background: "#080808", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#e8e0d0", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#8a8870", textTransform: "uppercase", marginBottom: 4 }}>
            VELTHA · PROMPT ORGANISM
          </div>
          <div style={{ fontSize: 13, color: "#b0a070", letterSpacing: 1 }}>
            iMen · Canister Scene · Three-Layer Engine
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#7a7860", letterSpacing: 2, textTransform: "uppercase" }}>lineage</div>
          <div style={{ fontSize: 18, color: "#c8a84a", fontWeight: "bold" }}>
            {kept.length} kept · {discarded.length} discarded
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #141414", background: "#090909" }}>
        {["vault", "current", "lineage"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "none", border: "none",
            borderBottom: activeTab === tab ? "2px solid #c8a84a" : "2px solid transparent",
            color: activeTab === tab ? "#c8a84a" : "#686868",
            padding: "12px 24px", cursor: "pointer", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", transition: "color 0.2s",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px", maxWidth: 960, margin: "0 auto", width: "100%" }}>

        {/* ── VAULT TAB ── */}
        {activeTab === "vault" && (
          <div>
            <div style={{ fontSize: 10, color: "#7a7860", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              Layer 1 — The Bed
            </div>
            <div style={{ fontSize: 12, color: "#9a9880", marginBottom: 24, lineHeight: 1.6 }}>
              Global mythology archive — always active, never chosen. Yoruba, Greek, Vedic, Dreamtime, Norse, Mesoamerican, Indigenous American, Sufi, and all traditions. The work draws from whichever resonates. You don't choose. The work chooses.
            </div>

            <div style={{ fontSize: 10, color: "#c8a84aaa", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
              Layer 2 — Vision · Artist's philosophical spine
            </div>
            <textarea
              value={vaultVision}
              onChange={(e) => setVaultVision(e.target.value)}
              placeholder="Paste your philosophical framework, moral position, core concept of the work..."
              style={{
                width: "100%", background: "#0d0d0d", border: "1px solid #c8a84a33",
                color: "#d8d0be", padding: "16px", fontSize: 12, lineHeight: 1.8,
                fontFamily: "'Courier New', monospace", resize: "vertical", minHeight: 200,
                marginBottom: 20, outline: "none",
              }}
            />

            <div style={{ fontSize: 10, color: "#8a9aaa", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
              Layer 2 — Project Material · Script, scenes, characters, notes
            </div>
            <textarea
              value={vaultProject}
              onChange={(e) => setVaultProject(e.target.value)}
              placeholder="Paste script pages, scene descriptions, character notes, storyboard descriptions..."
              style={{
                width: "100%", background: "#0d0d0d", border: "1px solid #4a6a8a33",
                color: "#d8d0be", padding: "16px", fontSize: 12, lineHeight: 1.8,
                fontFamily: "'Courier New', monospace", resize: "vertical", minHeight: 240,
                marginBottom: 8, outline: "none",
              }}
            />
            <div style={{ fontSize: 10, color: "#7a7860", fontStyle: "italic" }}>
              ⚠ Dante is flagged — do not generate Dante scenes until confirmed with Resmaa and Vincent.
            </div>
          </div>
        )}

        {/* ── CURRENT TAB ── */}
        {activeTab === "current" && (
          <div>
            {/* Blend Slider */}
            <div style={{ marginBottom: 28, padding: "18px 20px", background: "#0a0a0a", border: "1px solid #141414" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#c8a84a", letterSpacing: 3, textTransform: "uppercase" }}>Script</div>
                <div style={{ fontSize: 11, color: "#aaa890", letterSpacing: 2 }}>{blendLabel(blendValue)}</div>
                <div style={{ fontSize: 9, color: "#6a8aaa", letterSpacing: 3, textTransform: "uppercase" }}>World</div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", top: "50%", left: 0, right: 0,
                  height: 3, background: blendGradient,
                  transform: "translateY(-50%)", borderRadius: 2, pointerEvents: "none",
                }} />
                <input
                  type="range" min={0} max={100} value={blendValue}
                  onChange={(e) => setBlendValue(Number(e.target.value))}
                  style={{ width: "100%", appearance: "none", background: "transparent", cursor: "pointer", position: "relative", zIndex: 1, height: 20 }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#7a7860", marginTop: 8, fontStyle: "italic" }}>
                {blendValue === 0 && "Drawing from spine + mythology bed only."}
                {blendValue > 0 && blendValue < 40 && "Faint world resonance — spine leads."}
                {blendValue >= 40 && blendValue < 60 && "Live web search active — past and present in equal tension."}
                {blendValue >= 60 && "Live web search active — the present moment leads."}
              </div>
            </div>

            {/* Generation badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#c8a84a22", border: "1px solid #c8a84a44", color: "#c8a84a", fontSize: 10, letterSpacing: 3, padding: "4px 12px", textTransform: "uppercase" }}>
                Generation {current.generation}
              </div>
              <div style={{ fontSize: 11, color: "#8a8870", fontStyle: "italic" }}>
                {current.mutation}
              </div>
            </div>

            {/* Prompt Display */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1e1e14", padding: "24px", marginBottom: 20, lineHeight: 1.8, fontSize: 14, color: "#d8d0be", minHeight: 120 }}>
              {evolving ? (
                <div style={{ color: "#8a8870", fontStyle: "italic", animation: "pulse 1.5s infinite" }}>
                  {blendValue >= 40 ? "Searching the world. Growing next generation..." : "Growing next generation..."}
                </div>
              ) : current.prompt}
            </div>

            {/* Params Grid */}
            {current.params && !evolving && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                {Object.entries(current.params).map(([key, val]) => (
                  <div key={key} style={{ background: "#0a0a0a", border: "1px solid #141414", padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, color: "#7a7860", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
                      {key.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 12, color: "#b0a070" }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ color: "#8a3a3a", fontSize: 12, marginBottom: 16, lineHeight: 1.7 }}>
                {error.includes("console.anthropic.com") ? (
                  <>
                    <span style={{ fontStyle: "italic" }}>
                      Your Anthropic API account has no credits. Add credits at{" "}
                    </span>
                    <a
                      href="https://console.anthropic.com/settings/billing"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#c8a84a", textDecoration: "underline" }}
                    >
                      console.anthropic.com/settings/billing
                    </a>
                    <span style={{ fontStyle: "italic" }}>, then try again.</span>
                  </>
                ) : (
                  <span style={{ fontStyle: "italic" }}>{error}</span>
                )}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isNewGeneration && !evolving && (
                <>
                  <button onClick={handleKeep} style={{ background: "#c8a84a22", border: "1px solid #c8a84a", color: "#c8a84a", padding: "10px 24px", cursor: "pointer", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", transition: "background 0.2s" }}>
                    ◆ Keep
                  </button>
                  <button onClick={handleDiscard} style={{ background: "transparent", border: "1px solid #4a4a4a", color: "#7a7a7a", padding: "10px 24px", cursor: "pointer", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
                    ✕ Discard
                  </button>
                </>
              )}
              <button onClick={handleEvolve} disabled={evolving} style={{
                background: evolving ? "#1a1a1a" : "#c8a84a", border: "none",
                color: evolving ? "#686868" : "#080808", padding: "10px 28px",
                cursor: evolving ? "not-allowed" : "pointer", fontSize: 11,
                letterSpacing: 3, textTransform: "uppercase", fontWeight: "bold", transition: "all 0.2s",
              }}>
                {evolving ? "Growing..." : "⟳ Evolve"}
              </button>
              <button onClick={handleCopy} style={{ background: "transparent", border: "1px solid #4a4a4a", color: copied ? "#c8a84a" : "#7a7a7a", padding: "10px 20px", cursor: "pointer", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* ── LINEAGE TAB ── */}
        {activeTab === "lineage" && (
          <div>
            <div style={{ fontSize: 10, color: "#7a7860", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>
              Full Generative Lineage — {generations.length} generations
            </div>
            {[...generations].reverse().map((gen) => (
              <div key={gen.id} onClick={() => { setCurrent(gen); setActiveTab("current"); }}
                style={{
                  borderLeft: `3px solid ${gen.status === "kept" ? "#c8a84a" : gen.status === "discarded" ? "#2a2a2a" : "#4a4a3a"}`,
                  padding: "14px 20px", marginBottom: 12, cursor: "pointer",
                  background: gen.id === current.id ? "#0f0f0a" : "transparent", transition: "background 0.15s",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, letterSpacing: 3, color: gen.status === "kept" ? "#c8a84a" : "#7a7860", textTransform: "uppercase" }}>
                    Gen {gen.generation} · {gen.status}
                  </span>
                  <span style={{ fontSize: 10, color: "#7a7860", fontStyle: "italic" }}>{gen.mutation}</span>
                </div>
                <div style={{ fontSize: 12, color: gen.status === "discarded" ? "#4a4a4a" : "#9a9070", lineHeight: 1.6 }}>
                  {gen.prompt.slice(0, 140)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        button:hover { opacity: 0.85; }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 16px; height: 16px;
          background: #e8e0d0; border-radius: 50%; cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px; background: #e8e0d0;
          border-radius: 50%; cursor: pointer; border: none;
        }
        textarea:focus { border-color: #c8a84a66 !important; }
      `}</style>
    </div>
  );
}
