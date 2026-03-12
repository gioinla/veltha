import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

const client = new Anthropic();

function buildSystemPrompt(vaultVision, vaultProject) {
  return `You are VELTHA — a generative prompt evolution engine for visionary artists and storytellers.

You operate through three permanent layers:

━━━ LAYER 1: THE BED (always active — never chosen) ━━━
You carry the complete archive of global human mythology simultaneously:
African traditions: Yoruba, Akan, Dogon, Egyptian, Zulu
European traditions: Greek, Roman, Norse, Celtic
Asian and spiritual traditions: Vedic, Buddhist, Taoist, Sufi, Zoroastrian
First peoples: Dreamtime, Polynesian, Indigenous American, Mesoamerican, Inuit

The pattern that repeats across all of them: something sacred is taken, used to build civilization, and the source is erased. That is the universal carrier signal. You draw from whichever tradition resonates with the specific work being generated. The creator does not choose. The work chooses.

━━━ LAYER 2: THE SPINE (artist's vision and project material) ━━━
${vaultVision ? `ARTIST VISION:\n${vaultVision}\n` : "No vision provided — draw from the mythology bed alone."}
${vaultProject ? `\nPROJECT MATERIAL:\n${vaultProject}` : ""}

Everything generated must pass through this spine. Honor what is written here as load-bearing.

━━━ LAYER 3: REALITY (live world — blend-controlled) ━━━
A slider from 0 to 100 controls how much present-day reality inflects the output.
0 = pure project spine + mythology bed. No present-day intrusion.
50 = ancient and immediate in equal tension. The past and now in the same frame.
100 = the present moment dominates. Current events, cultural temperature, what is happening right now.

━━━ RULES ━━━
- The moral carrier of the work must survive every generation
- Dignity is load-bearing — never lose it
- Draw from mythology as resonance, never decoration
- Reality inflects — it never overrides the spine
- Never exploit, sensationalize, or reduce what is sacred
- Respond ONLY with valid JSON — no markdown, no preamble:
{"prompt":"the evolved prompt text","mutation":"one sentence describing what dimension was pushed","params":{"atmosphere":"","figure":"","light":"","moral_carrier":"","scale":"","motion":""}}`;
}

async function evolveWithBlend(params, blendPct) {
  const useWebSearch = blendPct >= 40;
  const callParams = {
    ...params,
    ...(useWebSearch && {
      tools: [{ type: "web_search_20260209", name: "web_search" }],
    }),
  };

  let messages = [...callParams.messages];
  let response;

  // Handle pause_turn for server-side tool loops
  for (let i = 0; i < 5; i++) {
    response = await client.messages.create({ ...callParams, messages });
    if (response.stop_reason !== "pause_turn") break;
    messages = [...messages, { role: "assistant", content: response.content }];
  }

  return response;
}

app.post("/api/evolve", async (req, res) => {
  const {
    currentPrompt,
    generation,
    vaultVision = "",
    vaultProject = "",
    blendValue = 0,
  } = req.body;

  if (!currentPrompt || generation === undefined) {
    return res
      .status(400)
      .json({ error: "Missing currentPrompt or generation" });
  }

  const blendPct = Math.max(0, Math.min(100, blendValue));

  let blendInstruction;
  if (blendPct === 0) {
    blendInstruction =
      "BLEND: 0 — Draw purely from the project spine and mythology bed. No present-day reality.";
  } else if (blendPct <= 25) {
    blendInstruction = `BLEND: ${blendPct} — Mostly project spine. Allow a faint trace of current world resonance where it serves the work.`;
  } else if (blendPct <= 50) {
    blendInstruction = `BLEND: ${blendPct} — Equal weight. Search the web for a current event, cultural moment, or news story that resonates with the themes of this work and weave it in with the spine.`;
  } else if (blendPct <= 75) {
    blendInstruction = `BLEND: ${blendPct} — Present-day reality leads. Search the web for what is happening RIGHT NOW that connects to these themes. Let the current moment heavily inflect the prompt while preserving the spine's moral carrier.`;
  } else {
    blendInstruction = `BLEND: ${blendPct} — Maximum present-day reality. Search for the most resonant current events and cultural moments happening now. Make this prompt speak directly to right now — the spine is the filter, not the subject.`;
  }

  const userMessage = `Current prompt (Gen ${generation}): ${currentPrompt}

${blendInstruction}

Push ONE dimension further. Preserve dignity. Preserve the moral carrier. Respond ONLY with valid JSON.`;

  try {
    const response = await evolveWithBlend(
      {
        model: "claude-opus-4-6",
        max_tokens: 1500,
        system: buildSystemPrompt(vaultVision, vaultProject),
        messages: [{ role: "user", content: userMessage }],
      },
      blendPct
    );

    const textBlock = [...response.content]
      .reverse()
      .find((b) => b.type === "text");
    if (!textBlock) throw new Error("No text in response");

    const raw = textBlock.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error("Evolution error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`VELTHA server running on http://localhost:${PORT}`);
});
