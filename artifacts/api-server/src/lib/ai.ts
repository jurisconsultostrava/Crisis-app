import OpenAI from "openai";
import { logger } from "./logger.js";
import type { Task } from "./store.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AiAnalysis {
  priority: number;
  category: "Finance" | "Klient" | "Dodavatel" | "Operativa";
  summary: string;
  draft_reply: string;
}

export async function analyzeEmail(
  subject: string,
  from: string,
  body: string
): Promise<AiAnalysis> {
  const prompt = `Jsi krizový manažer. Analyzuješ příchozí e-mail a musíš vyhodnotit jeho naléhavost a připravit odpověď.

Předmět: ${subject}
Od: ${from}
Obsah (prvních 2000 znaků):
${body.slice(0, 2000)}

Vrať POUZE platný JSON objekt (bez markdown, bez kódu) s těmito poli:
{
  "priority": číslo 1-10 (10 = nejnaléhavější krizová situace, 1 = běžná info),
  "category": jedno z ["Finance", "Klient", "Dodavatel", "Operativa"],
  "summary": "jedna věta v češtině popisující podstatu e-mailu a co je potřeba řešit",
  "draft_reply": "profesionální, lidský návrh odpovědi v češtině, která řeší situaci"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content ?? "{}";

    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as AiAnalysis;

    return {
      priority: Math.min(10, Math.max(1, Number(parsed.priority) || 5)),
      category: ["Finance", "Klient", "Dodavatel", "Operativa"].includes(
        parsed.category
      )
        ? parsed.category
        : "Operativa",
      summary: parsed.summary ?? "Nepodařilo se vygenerovat shrnutí.",
      draft_reply:
        parsed.draft_reply ?? "Dobrý den,\n\nDěkuji za Váš e-mail.\n\nS pozdravem",
    };
  } catch (err) {
    logger.error({ err }, "Chyba při AI analýze e-mailu");
    return {
      priority: 5,
      category: "Operativa",
      summary: "Nepodařilo se analyzovat e-mail.",
      draft_reply: "Dobrý den,\n\nDěkuji za Váš e-mail. Brzy se ozveme.\n\nS pozdravem",
    };
  }
}
