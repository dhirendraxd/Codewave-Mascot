import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
        resultIndex: number;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognition {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setSupported(true);
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event) => {
      let interim = "";
      let finalAdd = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalAdd += text;
        else interim += text;
      }
      if (finalAdd)
        setFinalTranscript(
          (prev) => (prev ? prev + " " : "") + finalAdd.trim(),
        );
      setInterimTranscript(interim);
    };
    rec.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };
    rec.onerror = (e) => {
      setError(e.error);
      setListening(false);
    };
    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    setError(null);
    setFinalTranscript("");
    setInterimTranscript("");
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    finalTranscript,
    interimTranscript,
    start,
    stop,
    reset,
    error,
  };
}
