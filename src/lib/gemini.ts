// Gemini API service wrapper for MemoryMesh.
// TODO: paste your Gemini API key below (https://aistudio.google.com/app/apikey).
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_MODEL = "gemini-1.5-flash-latest";
const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

export interface ProcessedNote {
  cleanedText: string;
  keywords: string[];
  bucket: string;
  place: string | null;
}

export interface NoteContext {
  cleanedText: string;
  keywords: string[];
  createdAt: Date;
  bucket?: string;
  place?: string | null;
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.4 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

export async function processNoteWithGemini(transcript: string): Promise<ProcessedNote> {
  const systemPrompt =
    "You are organizing a personal voice-note second brain. " +
    "Clean up the raw transcript (fix grammar, keep meaning). " +
    "Extract exactly 3 relevant keywords. " +
    "Choose a single concise bucket name (1-3 words, Title Case) that best groups this note with similar future notes — invent it from the content (e.g. 'Marketing Project', 'Morning Routine', 'Health'). " +
    "If a physical place is mentioned or strongly implied, return a short place label (e.g. 'Office', 'Home', 'Gym'); otherwise null. " +
    "Return strict JSON: { \"cleanedText\": string, \"keywords\": string[], \"bucket\": string, \"place\": string | null }.";
  const raw = await callGemini(systemPrompt, transcript);
  try {
    const parsed = JSON.parse(stripJsonFence(raw));
    return {
      cleanedText: String(parsed.cleanedText ?? transcript),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 5) : [],
      bucket: typeof parsed.bucket === "string" && parsed.bucket.trim() ? parsed.bucket.trim() : "General",
      place: typeof parsed.place === "string" && parsed.place.trim() ? parsed.place.trim() : null,
    };
  } catch {
    return { cleanedText: transcript, keywords: [], bucket: "General", place: null };
  }
}

export async function chatWithGemini(question: string, notes: NoteContext[]): Promise<string> {
  const systemPrompt =
    "You are MemoryMesh. Answer the user's prompt strictly using the provided context notes. Synthesize the information clearly.";
  const context = notes
    .map(
      (n, i) =>
        `Note ${i + 1} [${n.createdAt.toISOString()}]${n.bucket ? ` [${n.bucket}]` : ""}${n.place ? ` @${n.place}` : ""}\nText: ${n.cleanedText}\nKeywords: ${n.keywords.join(", ")}`,
    )
    .join("\n\n");
  const userPrompt = `Context notes:\n${context || "(no notes available)"}\n\nUser question: ${question}`;
  return callGemini(systemPrompt, userPrompt);
}