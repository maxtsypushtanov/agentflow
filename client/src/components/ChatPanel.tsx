import { useState, useRef, useEffect } from "react";
import { useFlowStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function ChatPanel() {
  const { isChatOpen, setChatOpen, chatMessages, addChatMessage, workflowId } = useFlowStore();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    addChatMessage("user", text);
    setIsSending(true);

    try {
      if (workflowId) {
        const res = await apiRequest("POST", `/api/execute/${workflowId}`, { input: text });
        const result = await res.json();
        addChatMessage("agent", result.output || result.result || JSON.stringify(result));
      } else {
        addChatMessage("agent", "No workflow loaded. Please load or create a workflow first.");
      }
    } catch (err: any) {
      addChatMessage("agent", `Error: ${err.message}`);
    }

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen) {
    return (
      <div className="absolute bottom-20 right-4 z-10">
        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg"
          onClick={() => setChatOpen(true)}
          data-testid="button-toggle-chat"
        >
          <MessageSquare className="w-4.5 h-4.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-20 right-4 z-10 w-[350px] h-[450px] bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col overflow-hidden"
      data-testid="chat-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#7c3aed]" />
          <span className="text-[12px] font-semibold text-[#e4e4e7]">Agent Chat</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-[#525252] hover:text-[#a1a1aa]"
          onClick={() => setChatOpen(false)}
          data-testid="button-close-chat"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[11px] text-[#3f3f46] text-center px-4">
              Send a message to interact with your workflow agent.
            </p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#7c3aed] text-white rounded-br-sm"
                  : "bg-[#1e1e1e] text-[#e4e4e7] border border-[#2a2a2a] rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg rounded-bl-sm px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 text-[#71717a] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#1e1e1e]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-8 text-[11px] bg-[#0f0f0f] border-[#2a2a2a] text-[#e4e4e7] placeholder:text-[#3f3f46]"
            disabled={isSending}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            className="h-8 w-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            data-testid="button-send-chat"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
