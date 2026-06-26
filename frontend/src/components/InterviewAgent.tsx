import { useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_ID = "github-interview-agent";

function pickAssistantText(payload: unknown): string {
  console.log("payload", payload);

  if (!payload || typeof payload !== "object") {
    return "No response from agent.";
  }

  const data = payload as {
    text?: unknown;
    response?: { output?: Array<{ content?: Array<{ text?: unknown }> }> };
    messages?: Array<{ role?: unknown; content?: unknown }>;
  };

  if (typeof data.text === "string" && data.text.trim()) {
    return data.text;
  }

  const outputText = data.response?.output?.[1]?.content?.[0]?.text;
  if (typeof outputText === "string" && outputText.trim()) {
    return outputText;
  }

  const lastMessage = data.messages?.[data.messages.length - 1];
  if (
    lastMessage?.role === "assistant" &&
    typeof lastMessage.content === "string" &&
    lastMessage.content.trim()
  ) {
    return lastMessage.content;
  }

  return "Agent responded without text.";
}

export default function InterviewAgent() {
  const [isDark, setIsDark] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userText = input.trim();
    if (!userText || isLoading) {
      return;
    }

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${AGENT_ID}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }],
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed with ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      const assistantText = pickAssistantText(payload);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbff,_#e7efff_55%,_#d9e7ff)] p-4 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_65%,_#01030a)] dark:text-slate-100 md:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-4xl items-center justify-center md:min-h-[calc(100vh-4rem)]">
          <section className="w-full rounded-3xl border border-white/40 bg-white/65 p-4 shadow-[0_24px_64px_rgba(7,12,30,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65 dark:shadow-[0_30px_70px_rgba(0,0,0,0.6)] sm:p-6">
            <header className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Interview Coach
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Chat with your GitHub interview agent
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {isDark ? "Light" : "Dark"}
              </button>
            </header>

            <section className="mb-4 h-[52vh] min-h-[280px] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/60 sm:p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Start by sending a message.
                </p>
              ) : null}

              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "ml-auto bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950"
                        : "mr-auto bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                      {message.role === "user" ? "You" : "Agent"}
                    </p>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-2">
              <label
                htmlFor="message-input"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Write the message
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div
                  className={`loading-input-shell w-full rounded-xl p-[2px] ${
                    isLoading ? "is-loading" : ""
                  }`}
                >
                  <input
                    id="message-input"
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about your repo or request an interview question"
                    disabled={isLoading}
                    className="relative z-10 w-full rounded-[10px] border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  className="rounded-xl border border-white/50 bg-white/35 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_28px_rgba(30,64,175,0.22)] backdrop-blur-md transition hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_28px_rgba(0,0,0,0.45)] dark:hover:bg-white/20"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

            {error ? (
              <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-200">
                Request failed: {error}
              </p>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
