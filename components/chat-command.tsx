import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { cn } from "@/lib/utils";
import { X, Send } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scrollarea";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@/hooks/use-chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatCommand = () => {
  const settings = useQuery(api.settings.getSettings);
  const { isOpen, onClose } = useChat();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimatingClosed, setIsAnimatingClosed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useChat.getState().toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [newUserMessage],
          model: settings?.model || "GPT-4o",
          apiKey: settings?.model === "GPT-4o" ? settings?.chatgptApiKey : settings?.claudeApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let assistantMessage = "";
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          const content = line.substring(2).replace(/^"|"$/g, '');
          assistantMessage += content;
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { role: "assistant", content: assistantMessage }
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {(!isOpen || isAnimating) && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isAnimating ? "100%" : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="fixed bottom-0 right-4 cursor-pointer"
            onClick={useChat.getState().toggle}
          >
            <div 
              className="bg-primary text-primary-foreground rounded-t-lg px-4 py-1.5 text-sm font-medium w-32 text-center hover:bg-primary/90 transition-colors"
            >
              AI Chat
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence
        onExitComplete={() => {
          setIsAnimating(false);
          setIsAnimatingClosed(true);
        }}
      >
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="fixed bottom-0 right-4 w-96 h-[600px] bg-background border shadow-lg rounded-t-lg overflow-hidden max-w-full mx-auto sm:mx-0"
            onAnimationStart={() => setIsAnimating(true)}
          >
            <div className="flex flex-col h-full">
              <div 
                className="flex items-center justify-between px-4 border-b cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={handleClose}
              >
                <h2 className="text-lg py-2 font-semibold">AI Chat</h2>
              </div>
              <ScrollArea className="flex-1 px-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start mb-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== "user" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/ai-avatar.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[80%] whitespace-pre-wrap",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content.split('\\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < message.content.split('\\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarImage src="/user-avatar.png" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1"
                    rows={1}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
