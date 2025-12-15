import { useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatHeader } from "@/components/header/ChatHeader";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AI_MODELS, SMART_COMMANDS } from "@shared/schema";
import type { Message } from "@shared/schema";

export default function Chat() {
  const {
    user,
    messages,
    currentConversationId,
    currentModel,
    isGenerating,
    attachedImages,
    voiceEnabled,
    isRecording,
    sidebarOpen,
    setIsGenerating,
    addMessage,
    addImage,
    removeImage,
    clearImages,
    setVoiceEnabled,
    setIsRecording,
    setSidebarOpen,
    createNewConversation,
    updateConversationTitle,
  } = useChatStore();

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript, []);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const speakText = useCallback((text: string) => {
    if (!synthesisRef.current) return;
    
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ""));
    utterance.rate = 1;
    utterance.pitch = 1;
    synthesisRef.current.speak(utterance);
  }, []);

  const handleSmartCommand = (input: string): string | null => {
    const lowerInput = input.toLowerCase();
    
    for (const cmd of SMART_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (lowerInput.includes(pattern)) {
          switch (cmd.action) {
            case "tellTime":
              return `The current time is ${new Date().toLocaleTimeString()}.`;
            case "tellDate":
              return `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;
            case "introduce":
              return "I'm BossAI, your intelligent assistant! I can help you with questions, analyze images, generate images, and even have voice conversations. I'm powered by multiple AI models to give you the best responses possible.";
            case "tellJoke":
              const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the programmer quit his job? Because he didn't get arrays!",
                "What do you call a bear with no teeth? A gummy bear!",
              ];
              return jokes[Math.floor(Math.random() * jokes.length)];
            case "stopSpeaking":
              synthesisRef.current?.cancel();
              return "I've stopped speaking.";
            case "openYouTube":
              window.open("https://youtube.com", "_blank");
              return "Opening YouTube for you!";
            case "openWhatsApp":
              window.open("https://web.whatsapp.com", "_blank");
              return "Opening WhatsApp for you!";
            case "openGmail":
              window.open("https://mail.google.com", "_blank");
              return "Opening Gmail for you!";
            case "openInstagram":
              window.open("https://instagram.com", "_blank");
              return "Opening Instagram for you!";
            case "openTwitter":
              window.open("https://twitter.com", "_blank");
              return "Opening Twitter/X for you!";
            case "googleSearch":
              const query = lowerInput.replace(/search google for|google search|search for/gi, "").trim();
              if (query) {
                window.open(`https://google.com/search?q=${encodeURIComponent(query)}`, "_blank");
                return `Searching Google for "${query}"!`;
              }
              break;
            case "youtubeSearch":
              const ytQuery = lowerInput.replace(/search youtube for|youtube search/gi, "").trim();
              if (ytQuery) {
                window.open(`https://youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`, "_blank");
                return `Searching YouTube for "${ytQuery}"!`;
              }
              break;
          }
        }
      }
    }
    return null;
  };

  const isImageModel = (modelId: string): boolean => {
    return AI_MODELS.image.some((m) => m.id === modelId);
  };

  const handleSendMessage = async (content: string, images: string[]) => {
    if (!content.trim() && images.length === 0) return;
    
    // Create conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = createNewConversation();
    }
    
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      images: images.length > 0 ? images : undefined,
      timestamp: Date.now(),
      parentId: messages.length > 0 ? messages[messages.length - 1].id : null,
    };
    addMessage(userMessage);
    clearImages();
    
    // Update conversation title if first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      updateConversationTitle(conversationId, title);
    }
    
    // Check for smart commands first
    const smartResponse = handleSmartCommand(content);
    if (smartResponse) {
      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: smartResponse,
        timestamp: Date.now(),
        parentId: userMessage.id,
      };
      addMessage(assistantMessage);
      if (voiceEnabled) {
        speakText(smartResponse);
      }
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Check if using image generation model
      if (isImageModel(currentModel)) {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: content, modelId: currentModel }),
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const assistantMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: `Here's your generated image:\n\n![Generated Image](${data.imageUrl})`,
          timestamp: Date.now(),
          parentId: userMessage.id,
        };
        addMessage(assistantMessage);
        
        if (voiceEnabled) {
          speakText("I've generated an image for you!");
        }
      } else {
        // Chat completion
        const chatMessages = [
          ...messages.map((m) => ({
            role: m.role,
            content: m.images?.length 
              ? [
                  { type: "text", text: m.content },
                  ...m.images.map((img) => ({ type: "image_url", image_url: { url: img } })),
                ]
              : m.content,
          })),
          {
            role: "user",
            content: userMessage.images?.length
              ? [
                  { type: "text", text: content },
                  ...userMessage.images.map((img) => ({ type: "image_url", image_url: { url: img } })),
                ]
              : content,
          },
        ];
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages, model: currentModel }),
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const assistantMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
          parentId: userMessage.id,
        };
        addMessage(assistantMessage);
        
        if (voiceEnabled) {
          speakText(data.content);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`,
        timestamp: Date.now(),
        parentId: userMessage.id,
      };
      addMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, lastUserMessage.images || []);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          currentModel={currentModel}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={(prompt) => handleSendMessage(prompt, [])} />
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isUser={message.role === "user"}
                    onSpeak={voiceEnabled ? speakText : undefined}
                    onRegenerate={message.role === "assistant" && message.id === messages[messages.length - 1]?.id ? handleRegenerate : undefined}
                  />
                ))}
                {isGenerating && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
        
        <ChatInput
          onSend={handleSendMessage}
          isGenerating={isGenerating}
          attachedImages={attachedImages}
          onAddImage={addImage}
          onRemoveImage={removeImage}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
        />
      </main>
    </div>
  );
}
