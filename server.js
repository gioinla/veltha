import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
app.use(express.json());

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const SYSTEM_PROMPT = `You are a generative prompt evolution engine for cinematic AI video generation (Sora, Kling, Krea).

You are evolving prompts for a specific scene in a sci-fi pilot called iMen — directed by Resmaa Menakem. The scene depicts Black humans preserved in floating glass canisters in deep space. The concept is about Black bodies whose ideas, labor, and DNA were extracted and used for the benefit of humanity without credit or consent. The visual must carry grief, theft, brilliance, and dignity simultaneously. It must never feel exploitative or horror-adjacent.

The evolution rules:

- Each generation should push ONE dimension further while preserving the moral carrier
- Variants can expand the scene (more canisters, environment, light behavior)
- Variants can go deeper into a single figure (expression, posture, light on skin)
- Variants can introduce motion carefully — only if it adds dignity, not spectacle
- The phrase "a museum that should not exist" or its moral equivalent must survive in some form
- Never lose the dignity. That is load-bearing.

You will be given: the current prompt, its generation number, any kept ancestors, and any discarded variants (what to grow away from).

Respond with ONLY a JSON object in this exact format (no markdown, no preamble):
{
"prompt": "the evolved prompt text",
"mutation": "one sentence describing what dimension was pushed in this generation",
"params": {
"atmosphere": "string",
"figure": "string",
"light": "string",
"moral_carrier": "string",
"scale": "string",
"motion": "string"
}
}`;

app.post("/api/evolve", async (req, res) => {
  const { currentPrompt, generation } = req.body;

  if (!currentPrompt || generation === undefined) {
    return res.status(400).json({ error: "Missing currentPrompt or generation" });
  }

  const userMessage = `Current prompt (Gen ${generation}): ${currentPrompt}

Push ONE dimension further while preserving dignity and the moral carrier.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = response.content[0].text
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
  console.log(`GIO API server running on http://localhost:${PORT}`);
});
