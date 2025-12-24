import { useEffect, useRef, useCallback, useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { VoiceRecordingOverlay } from "@/components/chat/VoiceRecordingOverlay";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { NameModal } from "@/components/settings/NameModal";
import { ChatHeader } from "@/components/header/ChatHeader";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AI_MODELS } from "@shared/schema";
import type { Message } from "@shared/schema";

export default function Chat() {
  const {
    user,
    userName,
    userGender,
    messages,
    currentConversationId,
    currentModel,
    isGenerating,
    attachedImages,
    voiceEnabled,
    isRecording,
    sidebarOpen,
    customSystemPrompt,
    hasSeenOnboarding,
    hasSeenSettings,
    setHasSeenOnboarding,
    setHasSeenSettings,
    setUserName,
    setIsGenerating,
    addMessage,
    updateMessage,
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  
  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    if (!hasSeenSettings) {
      const timer = setTimeout(() => {
        setShowNameModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenSettings]);
  
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const handleSetUserName = (name: string) => {
    setUserName(name);
    setHasSeenSettings(true);
    setShowNameModal(false);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  }, [messages.length]);

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
        // Chat completion with streaming
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
          body: JSON.stringify({ 
            messages: chatMessages, 
            model: currentModel, 
            customPrompt: customSystemPrompt,
            userName,
            userGender,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get response");
        }

        let fullContent = "";
        const assistantMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          parentId: userMessage.id,
        };

        addMessage(assistantMessage);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.content || "";
                  if (content) {
                    fullContent += content;
                    updateMessage(assistantMessage.id, fullContent);
                  }
                } catch {}
              }
            }
          }
        } catch (error) {
          throw error;
        }

        if (voiceEnabled && fullContent) {
          speakText(fullContent);
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
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        setIsRecording(false);
      }
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
        
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto"
            onScroll={handleScroll}
          >
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
                      userName={userName}
                      onSpeak={voiceEnabled ? speakText : undefined}
                      onRegenerate={message.role === "assistant" && message.id === messages[messages.length - 1]?.id ? handleRegenerate : undefined}
                      onEdit={message.role === "user" ? (id, content) => useChatStore.getState().updateMessage(id, content) : undefined}
                    />
                  ))}
                  {isGenerating && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
          
          {showScrollButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-20 right-4 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
              onClick={scrollToBottom}
              data-testid="button-scroll-down"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </div>
        
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
      
      <VoiceRecordingOverlay 
        isRecording={isRecording} 
        onStop={handleToggleRecording} 
      />
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={handleCloseOnboarding} 
      />
      
      <NameModal
        open={showNameModal}
        onClose={() => {
          setShowNameModal(false);
          setHasSeenSettings(true);
        }}
        onSetName={handleSetUserName}
        currentName={userName}
      />
    </div>
  );
}
