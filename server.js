import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json({ limit: "2mb" }));

const client = new Anthropic();

function buildSystemPrompt(vaultVision, vaultProject, sceneContext) {
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
${sceneContext ? `\nACTIVE SCENE FOCUS:\n${sceneContext}` : ""}

Everything generated must pass through this spine. Honor what is written here as load-bearing.

━━━ LAYER 3: REALITY (temporal anchor — time-controlled) ━━━
A temporal anchor specifies which moment in history to draw from.
Ancient time: draw from myth, archaeology, pattern — the record is fragmentary; let gaps be generative.
Pre-modern: draw from chronicles, trade, empire — what survived was chosen by power; read against the grain.
Industrial/modern: draw from documented movements, technology, colonial machinery at full operation.
Recent/present: draw from the living world — current events, cultural temperature, what is happening now.

━━━ RULES ━━━
- The moral carrier of the work must survive every generation
- Dignity is load-bearing — never lose it
- Draw from mythology as resonance, never decoration
- The temporal anchor inflects — it never overrides the spine
- Never exploit, sensationalize, or reduce what is sacred
- Respond ONLY with valid JSON — no markdown, no preamble:
{"prompt":"the evolved prompt text","mutation":"one sentence describing what dimension was pushed","params":{"atmosphere":"","figure":"","light":"","moral_carrier":"","scale":"","motion":""}}`;
}

function buildTimeInstruction(year) {
  const yd = year < 0 ? `${Math.abs(year)} BCE` : `${year}`;

  if (year >= 2024) {
    return `TEMPORAL ANCHOR: Present (${yd}) — Search the web for what is happening RIGHT NOW that resonates with these themes. Current events, cultural temperature, the immediate world inflecting the work.`;
  }
  if (year >= 2010) {
    return `TEMPORAL ANCHOR: ${yd} — Draw from the recent past. Digital age, social media era, accelerating global change, uprisings and ruptures of the 2010s–2020s.`;
  }
  if (year >= 1950) {
    return `TEMPORAL ANCHOR: ${yd} — Draw from mid-to-late 20th century. Civil rights movements, decolonization, cold war, broadcast culture, the long fight for dignity in the modern state.`;
  }
  if (year >= 1800) {
    return `TEMPORAL ANCHOR: ${yd} — Draw from the industrial and colonial age. Empire at full operation. The machinery of extraction is documented — the cost was erased. Read it back.`;
  }
  if (year >= 500) {
    return `TEMPORAL ANCHOR: ${yd} — Draw from pre-modern recorded history. Chronicles, court records, trade documents. What survives was chosen by the powerful. Read against the grain of the archive.`;
  }
  if (year >= -500) {
    return `TEMPORAL ANCHOR: ${yd} — Draw from classical antiquity. Greek, Roman, Persian, Han, Mayan, Aksumite. Myth and philosophy are inseparable here. The empire and the cosmos share a grammar.`;
  }
  return `TEMPORAL ANCHOR: ${yd} — Deep ancient time. Almost no direct record survives. Draw entirely from the mythology bed. Let the carrier signal from before writing speak through the work. The gaps are the truth.`;
}

async function evolveWithTemporalAnchor(params, useWebSearch) {
  const callParams = {
    ...params,
    ...(useWebSearch && {
      tools: [{ type: "web_search_20260209", name: "web_search" }],
    }),
  };

  let messages = [...callParams.messages];
  let response;

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
    timeYear = 2026,
    sceneContext = "",
  } = req.body;

  if (!currentPrompt || generation === undefined) {
    return res
      .status(400)
      .json({ error: "Missing currentPrompt or generation" });
  }

  const year = Math.round(Math.max(-3000, Math.min(2026, timeYear)));
  const useWebSearch = year >= 2022;
  const timeInstruction = buildTimeInstruction(year);

  const userMessage = `Current prompt (Gen ${generation}): ${currentPrompt}

${timeInstruction}

Push ONE dimension further. Preserve dignity. Preserve the moral carrier. Respond ONLY with valid JSON.`;

  try {
    const response = await evolveWithTemporalAnchor(
      {
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        system: buildSystemPrompt(vaultVision, vaultProject, sceneContext),
        messages: [{ role: "user", content: userMessage }],
      },
      useWebSearch
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

    const msg = err.message || "";
    const isCreditError =
      (err.status === 400 || err.status === 402) &&
      msg.includes("credit balance is too low");

    if (isCreditError) {
      return res.status(402).json({
        error: "INSUFFICIENT_CREDITS",
        message:
          "Your Anthropic API account has no credits. Add credits at console.anthropic.com/settings/billing, then try again.",
      });
    }

    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`VELTHA server running on http://localhost:${PORT}`);
});
