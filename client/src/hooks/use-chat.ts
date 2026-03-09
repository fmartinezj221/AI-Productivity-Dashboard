import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

// Types matching the backend chat storage schema
export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });
}

export function useConversation(id: number | null) {
  return useQuery<Conversation>({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, { title: string }>({
    mutationFn: async ({ title }) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

// Hook for SSE Chat Streaming
export function useChatStream(conversationId: number | null) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setStreamingContent("");
    setOptimisticUserMessage(content);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        
        // Keep the last partial chunk in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                setStreamingContent((prev) => prev + data.content);
              }
              if (data.done) {
                // Stream finished
              }
              if (data.error) {
                console.error("Stream error:", data.error);
              }
            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat streaming failed", error);
    } finally {
      setIsStreaming(false);
      setOptimisticUserMessage(null);
      // Refresh the conversation history to get the actual saved messages
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
    }
  }, [conversationId, queryClient]);

  return {
    sendMessage,
    isStreaming,
    streamingContent,
    optimisticUserMessage
  };
}
