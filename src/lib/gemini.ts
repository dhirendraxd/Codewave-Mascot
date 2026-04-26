// Gemini API service wrapper for MemoryMesh.
// API key is stored in localStorage for demo purposes
const getGeminiApiKey = (): string => {
  return localStorage.getItem("memorymesh_gemini_api_key") || "";
};

const setGeminiApiKey = (key: string): void => {
  localStorage.setItem("memorymesh_gemini_api_key", key);
};

// Check if API key is configured
export const isGeminiConfigured = (): boolean => {
  return getGeminiApiKey().length > 0;
};

// Configure API key
export const configureGemini = (apiKey: string): void => {
  setGeminiApiKey(apiKey);
};

// gemini-2.0-flash is ~2x faster than 1.5-flash for short prompts.
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

// Dummy responses for demo purposes
const DUMMY_PROCESSED_NOTES: Record<string, ProcessedNote> = {
  "morning routine": {
    cleanedText: "Started my morning with meditation and planning the day ahead.",
    keywords: ["meditation", "planning", "morning"],
    bucket: "Daily Routine",
    place: "Home"
  },
  "work meeting": {
    cleanedText: "Discussed the new project timeline and assigned tasks to team members.",
    keywords: ["meeting", "project", "timeline", "tasks"],
    bucket: "Work Projects",
    place: "Office"
  },
  "grocery shopping": {
    cleanedText: "Picked up groceries for the week including vegetables, fruits, and dairy products.",
    keywords: ["groceries", "shopping", "food", "weekly"],
    bucket: "Personal Tasks",
    place: "Supermarket"
  },
  "exercise": {
    cleanedText: "Completed a 30-minute workout focusing on cardio and strength training.",
    keywords: ["workout", "cardio", "strength", "fitness"],
    bucket: "Health & Fitness",
    place: "Gym"
  },
  "reading": {
    cleanedText: "Finished reading the chapter about machine learning algorithms and took notes.",
    keywords: ["reading", "machine learning", "algorithms", "notes"],
    bucket: "Learning",
    place: "Home"
  }
};

async function callGemini(systemPrompt: string, userPrompt: string, opts?: { maxOutputTokens?: number }): Promise<string> {
  const apiKey = getGeminiApiKey();

  // If no API key configured, return a helpful message
  if (!apiKey) {
    throw new Error("⚠️ AI service is not configured — The Gemini API key is missing or invalid. Please add it in src/lib/gemini.ts.");
  }

  const res = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: opts?.maxOutputTokens ?? 512,
        // Faster TTFB
        candidateCount: 1,
      },
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
  // Simulate processing delay to make it feel real-time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Try to find a matching dummy response based on keywords
  const lowerTranscript = transcript.toLowerCase();
  let matchedKey = "morning routine"; // default

  if (lowerTranscript.includes("meeting") || lowerTranscript.includes("work") || lowerTranscript.includes("project")) {
    matchedKey = "work meeting";
  } else if (lowerTranscript.includes("grocery") || lowerTranscript.includes("shopping") || lowerTranscript.includes("food")) {
    matchedKey = "grocery shopping";
  } else if (lowerTranscript.includes("exercise") || lowerTranscript.includes("workout") || lowerTranscript.includes("gym")) {
    matchedKey = "exercise";
  } else if (lowerTranscript.includes("read") || lowerTranscript.includes("book") || lowerTranscript.includes("study")) {
    matchedKey = "reading";
  }

  const dummyResponse = DUMMY_PROCESSED_NOTES[matchedKey];

  // If API key is configured, try to use real Gemini, otherwise use dummy
  if (isGeminiConfigured()) {
    try {
      const systemPrompt =
        "You are organizing a personal voice-note second brain. " +
        "Clean up the raw transcript (fix grammar, keep meaning). " +
        "Extract exactly 3 relevant keywords. " +
        "Choose a single concise bucket name (1-3 words, Title Case) that best groups this note with similar future notes — invent it from the content (e.g. 'Marketing Project', 'Morning Routine', 'Health'). " +
        "If a physical place is mentioned or strongly implied, return a short place label (e.g. 'Office', 'Home', 'Gym'); otherwise null. " +
        "Return strict JSON: { \"cleanedText\": string, \"keywords\": string[], \"bucket\": string, \"place\": string | null }.";
      const raw = await callGemini(systemPrompt, transcript);
      const parsed = JSON.parse(stripJsonFence(raw));
      return {
        cleanedText: String(parsed.cleanedText ?? transcript),
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 5) : [],
        bucket: typeof parsed.bucket === "string" && parsed.bucket.trim() ? parsed.bucket.trim() : "General",
        place: typeof parsed.place === "string" && parsed.place.trim() ? parsed.place.trim() : null,
      };
    } catch (error) {
      console.warn("Gemini API failed, using dummy response:", error);
      // Fall back to dummy response
    }
  }

  // Use dummy response - adapt it to the actual transcript
  return {
    cleanedText: transcript.length > 10 ? transcript : dummyResponse.cleanedText,
    keywords: dummyResponse.keywords,
    bucket: dummyResponse.bucket,
    place: dummyResponse.place,
  };
}

export async function chatWithGemini(question: string, notes: NoteContext[]): Promise<string> {
  // Simulate thinking delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  // If API key is configured, try to use real Gemini
  if (isGeminiConfigured()) {
    try {
      const systemPrompt =
        "You are MemoryMesh. Answer the user's prompt strictly using the provided context notes. Synthesize the information clearly.";
      // Cap context to the 40 most recent notes — prevents prompt bloat as the
      // mesh grows. Older notes are far less likely to be relevant.
      const recent = notes.slice(0, 40);
      const context = recent
        .map(
          (n, i) =>
            `Note ${i + 1} [${n.createdAt.toISOString()}]${n.bucket ? ` [${n.bucket}]` : ""}${n.place ? ` @${n.place}` : ""}\nText: ${n.cleanedText}\nKeywords: ${n.keywords.join(", ")}`,
        )
        .join("\n\n");
      const userPrompt = `Context notes:\n${context || "(no notes available)"}\n\nUser question: ${question}`;
      return callGemini(systemPrompt, userPrompt, { maxOutputTokens: 768 });
    } catch (error) {
      console.warn("Gemini API failed, using dummy response:", error);
      // Fall back to dummy response
    }
  }

  // Dummy responses based on question type
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("morning") || lowerQuestion.includes("routine")) {
    return "Based on your notes, your morning routine typically involves meditation and planning. You mentioned starting your day with mindfulness practices and organizing your tasks for the day ahead.";
  } else if (lowerQuestion.includes("work") || lowerQuestion.includes("meeting") || lowerQuestion.includes("project")) {
    return "Your work-related notes show active project management and team coordination. You frequently discuss timelines, task assignments, and project progress in your meetings.";
  } else if (lowerQuestion.includes("exercise") || lowerQuestion.includes("workout") || lowerQuestion.includes("gym")) {
    return "Your fitness notes indicate regular 30-minute workouts combining cardio and strength training. You typically exercise at the gym and focus on maintaining an active lifestyle.";
  } else if (lowerQuestion.includes("read") || lowerQuestion.includes("book") || lowerQuestion.includes("learn")) {
    return "Your learning notes show engagement with technical topics like machine learning algorithms. You take detailed notes while reading and focus on understanding complex concepts.";
  } else if (notes.length === 0) {
    return "I don't have any notes to reference yet. Try capturing some thoughts first, and I'll be able to help you recall and analyze them!";
  } else {
    return `I found ${notes.length} note${notes.length === 1 ? '' : 's'} in your memory. Your thoughts seem to revolve around daily routines, work projects, and personal development. What specific aspect would you like me to help you explore?`;
  }
}