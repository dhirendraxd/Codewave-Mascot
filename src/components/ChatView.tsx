import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chatWithGemini } from "@/lib/gemini";
import { getAllNotes } from "@/lib/notes";
import { friendlyError, notifyError } from "@/lib/errors";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const askQuestion = async (question: string) => {
    setPending(true);
    let stage: "firestore-read" | "gemini" = "firestore-read";
    try {
      if (!user?.id) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Please sign in to chat with your memories.",
          },
        ]);
        return;
      }
      const notes = await getAllNotes(user.id);
      stage = "gemini";
      const reply = await chatWithGemini(
        question,
        notes.map((n) => ({
          cleanedText: n.cleanedText,
          keywords: n.keywords,
          createdAt: n.createdAt,
          bucket: n.bucket,
          place: n.place ?? n.city ?? null,
        })),
      );
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch (err) {
      const { title, description } = friendlyError(stage, err);
      notifyError(stage, err, () => {
        void askQuestion(question);
      });
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ ${title} — ${description}`,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || pending) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    await askQuestion(question);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && !pending && (
            <div className="mt-20 text-center text-sm text-muted-foreground">
              Ask me anything about what you've captured.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex animate-fade-in-up",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-card-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex animate-fade-in-up justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask about your memories…"
            className="min-h-11 max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={pending || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}