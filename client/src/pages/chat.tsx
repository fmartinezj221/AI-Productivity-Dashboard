import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { MessageSquarePlus, Send, Bot, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  useConversations, 
  useConversation, 
  useCreateConversation, 
  useDeleteConversation,
  useChatStream 
} from "@/hooks/use-chat";

export default function Chat() {
  const [match, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const currentId = match && params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  const { data: conversations = [], isLoading: loadingConvos } = useConversations();
  const { data: currentConversation, isLoading: loadingChat } = useConversation(currentId);
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();
  const { sendMessage, isStreaming, streamingContent, optimisticUserMessage } = useChatStream(currentId);

  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages, streamingContent, optimisticUserMessage]);

  const handleCreateNew = async () => {
    try {
      const convo = await createMutation.mutateAsync({ title: "New Conversation" });
      setLocation(`/chat/${convo.id}`);
    } catch (error) {
      toast({ title: "Failed to create chat", variant: "destructive" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
      if (currentId === id) setLocation("/chat");
      toast({ title: "Chat deleted" });
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !currentId || isStreaming) return;
    
    const msg = inputMsg;
    setInputMsg("");
    await sendMessage(msg);
  };

  // If no chat selected but there are chats, pick the first one
  useEffect(() => {
    if (!match && conversations.length > 0) {
      setLocation(`/chat/${conversations[0].id}`);
    }
  }, [match, conversations, setLocation]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
        
        {/* Chat Sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4 border-r border-border/50 pr-4 hidden md:flex">
          <Button 
            className="w-full justify-start rounded-xl h-11 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none shadow-none" 
            onClick={handleCreateNew}
            disabled={createMutation.isPending}
          >
            <MessageSquarePlus className="w-5 h-5 mr-2" />
            New Chat
          </Button>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {loadingConvos ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : conversations.map(convo => (
              <div 
                key={convo.id}
                onClick={() => setLocation(`/chat/${convo.id}`)}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
                  ${currentId === convo.id ? 'bg-muted border border-border/50' : 'hover:bg-muted/50 border border-transparent'}
                `}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate text-foreground">{convo.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(convo.createdAt), "MMM d")}
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                  onClick={(e) => handleDelete(e, convo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
          {currentId && currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-border/50 flex items-center bg-card/50 backdrop-blur-sm z-10 shrink-0">
                <h2 className="font-display font-bold text-lg">{currentConversation.title}</h2>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {currentConversation.messages?.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* Optimistic User Message */}
                {optimisticUserMessage && (
                  <div className="flex gap-4 flex-row-reverse opacity-70">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl p-4 bg-primary text-primary-foreground rounded-tr-sm">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{optimisticUserMessage}</p>
                    </div>
                  </div>
                )}

                {/* Streaming Assistant Response */}
                {(isStreaming && streamingContent) && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl p-4 bg-muted text-foreground rounded-tl-sm border border-border/50">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {streamingContent}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle" />
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-card shrink-0">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <Input 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask AI for productivity tips..."
                    className="h-14 rounded-2xl pl-6 pr-14 bg-muted/50 border-border/50 focus-visible:ring-primary/20 text-base"
                    disabled={isStreaming}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="absolute right-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white"
                    disabled={!inputMsg.trim() || isStreaming}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">AI Assistant</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Create a new conversation or select an existing one from the sidebar to start chatting.
              </p>
              <Button onClick={handleCreateNew} className="rounded-xl hidden max-md:flex">
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
