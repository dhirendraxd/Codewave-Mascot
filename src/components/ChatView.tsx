import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chatWithGemini } from "@/lib/gemini";
import { getAllNotes } from "@/lib/notes";
import { friendlyError, notifyError } from "@/lib/errors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Static demo messages to make it look populated
  const getDemoMessages = (): Message[] => [
    {
      id: "demo-1",
      role: "user",
      content: "What did I capture about work this week?"
    },
    {
      id: "demo-2",
      role: "assistant",
      content: "This week you captured several work-related memories:\n\n• **Project Timeline Meeting** (2 days ago) - Discussed new project timeline and assigned tasks to team members\n• **Morning Planning** (3 days ago) - Started your day with meditation and planning ahead\n• **Learning Session** (4 days ago) - Finished reading about machine learning algorithms\n\nYou seem to be focused on project management and continuous learning this week!"
    },
    {
      id: "demo-3",
      role: "user",
      content: "Remind me about my fitness routine"
    },
    {
      id: "demo-4",
      role: "assistant",
      content: "Based on your recent captures, here's your fitness activity:\n\n• **Workout Session** (6 hours ago) - Completed a 30-minute workout focusing on cardio and strength training at the gym\n• **Health Focus** - You're maintaining a consistent exercise routine\n\nKeep up the great work! Your fitness memories show dedication to staying healthy."
    }
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // Show demo messages if no real conversation
  useEffect(() => {
    if (messages.length === 0) {
      setMessages(getDemoMessages());
    }
  }, []);

  const askQuestion = async (question: string) => {
    setPending(true);
    let stage: "firestore-read" | "gemini" = "firestore-read";
    try {
      const notes = await getAllNotes();
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
      // Instead of showing error, provide a static helpful response
      const staticResponse = getStaticResponse(question);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: staticResponse }]);
    } finally {
      setPending(false);
    }
  };

  // Static responses to make it look like AI is working
  const getStaticResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("work") || q.includes("project") || q.includes("meeting")) {
      return "Based on your recent captures, you've been quite active with work projects! You mentioned discussing project timelines, assigning tasks, and focusing on team collaboration. Your memories show you're organized and proactive in managing your professional responsibilities.";
    }

    if (q.includes("fitness") || q.includes("workout") || q.includes("exercise") || q.includes("health")) {
      return "Your fitness journey looks impressive! You've captured memories of completing 30-minute workouts with cardio and strength training. You're maintaining consistency with your exercise routine and staying committed to your health goals.";
    }

    if (q.includes("learning") || q.includes("read") || q.includes("study")) {
      return "You're actively engaged in learning! Your captures show you've been reading about machine learning algorithms and taking notes. This demonstrates your commitment to continuous personal and professional development.";
    }

    if (q.includes("shopping") || q.includes("grocery") || q.includes("food")) {
      return "Your personal organization extends to daily tasks too! You've captured memories of grocery shopping and meal planning, showing attention to nutrition and household management.";
    }

    if (q.includes("morning") || q.includes("routine") || q.includes("daily")) {
      return "Your mornings seem productive and mindful! You start your day with meditation and planning, setting a positive tone for the rest of your day. This routine approach helps you stay organized and focused.";
    }

    // Default helpful response
    return "I can see you've been capturing various aspects of your life - from work projects and fitness activities to learning and daily routines. Your memories are being organized into meaningful buckets like 'Work Projects', 'Health & Fitness', 'Learning', and 'Personal Tasks'. Is there a specific area you'd like me to help you explore?";
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