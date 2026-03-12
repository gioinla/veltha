import { useState, useRef } from "react";

const SEED_PROMPT = `A single vertical glass canister, floor-to-ceiling, floating in deep black space. Inside, a Black man in his 40s stands upright, eyes open, still — not trapped, preserved. He wears ordinary clothes. His expression is dignified, unresolved. The glass is thick and slightly curved, refracting light. A faint luminous energy radiates from inside the canister — warm amber and gold — as if what is contained is still generative. The exterior is cold blue-black. Cinematic. IMAX scale. No motion. Specimen lighting. The image should feel like a museum that should not exist.`;

const SEED_PARAMS = {
  atmosphere: "grief + theft + dignity",
  figure: "Black man, 40s, preserved not trapped",
  light: "warm amber interior / cold blue-black exterior",
  moral_carrier: "a museum that should not exist",
  scale: "IMAX cinematic",
  motion: "none — still",
};

async function evolvePrompt(currentPrompt, generation) {
  const response = await fetch("/api/evolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPrompt, generation }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Evolution failed");
  return data;
}

export default function PromptOrganism() {
  const [generations, setGenerations] = useState([
    {
      id: 0,
      generation: 0,
      prompt: SEED_PROMPT,
      params: SEED_PARAMS,
      mutation: "Seed — origin DNA",
      status: "kept",
    },
  ]);
  const [current, setCurrent] = useState({
    id: 0,
    generation: 0,
    prompt: SEED_PROMPT,
    params: SEED_PARAMS,
    mutation: "Seed — origin DNA",
    status: "pending",
  });
  const [evolving, setEvolving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const [copied, setCopied] = useState(false);

  const kept = generations.filter((g) => g.status === "kept");
  const discarded = generations.filter((g) => g.status === "discarded");
  const nextGen = Math.max(...generations.map((g) => g.generation)) + 1;

  const handleEvolve = async () => {
    setEvolving(true);
    setError(null);
    try {
      const result = await evolvePrompt(current.prompt, current.generation);
      const newEntry = {
        id: Date.now(),
        generation: nextGen,
        prompt: result.prompt,
        params: result.params,
        mutation: result.mutation,
        status: "pending",
      };
      setCurrent(newEntry);
      setActiveTab("current");
    } catch (e) {
      setError(`Evolution failed: ${e.message}`);
    }
    setEvolving(false);
  };

  const handleKeep = () => {
    const kept = { ...current, status: "kept" };
    setGenerations((prev) => [...prev, kept]);
    setCurrent(kept);
  };

  const handleDiscard = () => {
    const disc = { ...current, status: "discarded" };
    setGenerations((prev) => [...prev, disc]);
    const lastKept = [...generations].reverse().find((g) => g.status === "kept");
    if (lastKept) setCurrent(lastKept);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isNewGeneration = !generations.find((g) => g.id === current.id);

  return (
    <div
      style={{
        background: "#080808",
        minHeight: "100vh",
        fontFamily: "'Courier New', monospace",
        color: "#e8e0d0",
        padding: "0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1a1a1a",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0a0a0a",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: "#4a4a3a",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            GIO · PROMPT ORGANISM
          </div>
          <div style={{ fontSize: 13, color: "#8a7a5a", letterSpacing: 1 }}>
            iMen · Canister Scene · Generative Lineage Engine
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              color: "#3a3a2a",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            lineage
          </div>
          <div style={{ fontSize: 18, color: "#c8a84a", fontWeight: "bold" }}>
            {kept.length} kept · {discarded.length} discarded
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #141414",
          background: "#090909",
        }}
      >
        {["current", "lineage"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab
                  ? "2px solid #c8a84a"
                  : "2px solid transparent",
              color: activeTab === tab ? "#c8a84a" : "#3a3a3a",
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "28px",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {activeTab === "current" && (
          <div>
            {/* Generation badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "#c8a84a22",
                  border: "1px solid #c8a84a44",
                  color: "#c8a84a",
                  fontSize: 10,
                  letterSpacing: 3,
                  padding: "4px 12px",
                  textTransform: "uppercase",
                }}
              >
                Generation {current.generation}
              </div>
              <div
                style={{ fontSize: 11, color: "#4a4a3a", fontStyle: "italic" }}
              >
                {current.mutation}
              </div>
            </div>

            {/* Prompt Display */}
            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid #1e1e14",
                padding: "24px",
                marginBottom: 20,
                lineHeight: 1.8,
                fontSize: 14,
                color: "#d8d0be",
                position: "relative",
                minHeight: 120,
              }}
            >
              {evolving ? (
                <div
                  style={{
                    color: "#4a4a3a",
                    fontStyle: "italic",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  Growing next generation...
                </div>
              ) : (
                current.prompt
              )}
            </div>

            {/* Params Grid */}
            {current.params && !evolving && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {Object.entries(current.params).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: "#0a0a0a",
                      border: "1px solid #141414",
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "#3a3a2a",
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      {key.replace("_", " ")}
                    </div>
                    <div style={{ fontSize: 12, color: "#8a7a5a" }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  color: "#8a3a3a",
                  fontSize: 12,
                  marginBottom: 16,
                  fontStyle: "italic",
                }}
              >
                {error}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isNewGeneration && !evolving && (
                <>
                  <button
                    onClick={handleKeep}
                    style={{
                      background: "#c8a84a22",
                      border: "1px solid #c8a84a",
                      color: "#c8a84a",
                      padding: "10px 24px",
                      cursor: "pointer",
                      fontSize: 11,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      transition: "background 0.2s",
                    }}
                  >
                    ◆ Keep
                  </button>
                  <button
                    onClick={handleDiscard}
                    style={{
                      background: "transparent",
                      border: "1px solid #2a2a2a",
                      color: "#4a4a4a",
                      padding: "10px 24px",
                      cursor: "pointer",
                      fontSize: 11,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                    }}
                  >
                    ✕ Discard
                  </button>
                </>
              )}
              <button
                onClick={handleEvolve}
                disabled={evolving}
                style={{
                  background: evolving ? "#1a1a1a" : "#c8a84a",
                  border: "none",
                  color: evolving ? "#3a3a3a" : "#080808",
                  padding: "10px 28px",
                  cursor: evolving ? "not-allowed" : "pointer",
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
              >
                {evolving ? "Growing..." : "⟳ Evolve"}
              </button>
              <button
                onClick={handleCopy}
                style={{
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  color: copied ? "#c8a84a" : "#4a4a4a",
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "lineage" && (
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#3a3a2a",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Full Generative Lineage — {generations.length} generations
            </div>
            {[...generations].reverse().map((gen) => (
              <div
                key={gen.id}
                onClick={() => {
                  setCurrent(gen);
                  setActiveTab("current");
                }}
                style={{
                  borderLeft: `3px solid ${
                    gen.status === "kept"
                      ? "#c8a84a"
                      : gen.status === "discarded"
                      ? "#2a2a2a"
                      : "#4a4a3a"
                  }`,
                  padding: "14px 20px",
                  marginBottom: 12,
                  cursor: "pointer",
                  background:
                    gen.id === current.id ? "#0f0f0a" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color:
                        gen.status === "kept" ? "#c8a84a" : "#3a3a2a",
                      textTransform: "uppercase",
                    }}
                  >
                    Gen {gen.generation} · {gen.status}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#3a3a2a",
                      fontStyle: "italic",
                    }}
                  >
                    {gen.mutation}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color:
                      gen.status === "discarded" ? "#2a2a2a" : "#6a6050",
                    lineHeight: 1.6,
                  }}
                >
                  {gen.prompt.slice(0, 140)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
