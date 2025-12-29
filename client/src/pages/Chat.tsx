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
import { ProfileModal } from "@/components/settings/ProfileModal";
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
    userAvatar,
    userPersonality,
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
    hasSeenProfile,
    setHasSeenOnboarding,
    setHasSeenSettings,
    setHasSeenProfile,
    setUserName,
    setUserAvatar,
    setUserPersonality,
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    if (!hasSeenProfile) {
      const timer = setTimeout(() => {
        setShowProfileModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenProfile]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
  };

  const handleSaveProfile = (name: string, avatar: string, personality: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    setUserPersonality(personality);
    setHasSeenProfile(true);
    setShowProfileModal(false);
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
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        try {
          if (event.results && event.results.length > 0) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (transcript && transcript.trim()) {
              handleSendMessage(transcript, []);
            }
          }
        } catch (error) {
          console.error("Error processing speech result:", error);
        }
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error !== "no-speech" && event.error !== "audio-capture" && event.error !== "aborted") {
          toast({
            title: "Voice Error",
            description: "Could not recognize speech. Please try again.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        // Reset recognition object to allow reuse
        try {
          recognitionRef.current?.abort();
        } catch {}
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [toast]);

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
                  ...m.images.map((img) => ({
                    type: "image_url",
                    image_url: { url: img },
                  })),
                ]
              : m.content,
          })),
          {
            role: "user",
            content: userMessage.images?.length
              ? [
                  { type: "text", text: content },
                  ...userMessage.images.map((img) => ({
                    type: "image_url",
                    image_url: { url: img },
                  })),
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
            enableWebSearch: true,
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

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              
              for (let i = 0; i < lines.length - 1; i++) {
                const line = lines[i];
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
                  if (!data) continue;

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
              
              buffer = lines[lines.length - 1];
            }
            
            if (buffer.trim().startsWith("data: ")) {
              const data = buffer.trim().slice(6).trim();
              if (data && data !== "[DONE]") {
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
          } catch (error) {
            console.error("Stream reading error:", error);
            if (!fullContent) throw error;
          }
        }

        if (voiceEnabled && fullContent) {
          speakText(fullContent);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to get response. Please try again.",
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
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    } else {
      try {
        // Create fresh recognition object if current one is not in a good state
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition && recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsRecording(false);
        
        // Try to reinitialize if start fails
        try {
          const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
          if (SpeechRecognition) {
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = false;
            newRecognition.interimResults = false;
            newRecognition.lang = "en-US";
            recognitionRef.current = newRecognition;
            
            // Re-attach all event handlers
            newRecognition.onstart = () => setIsRecording(true);
            newRecognition.onresult = (event: any) => {
              try {
                if (event.results && event.results.length > 0) {
                  const transcript = event.results[event.results.length - 1][0].transcript;
                  if (transcript && transcript.trim()) {
                    handleSendMessage(transcript, []);
                  }
                }
              } catch (error) {
                console.error("Error processing speech result:", error);
              }
              setIsRecording(false);
            };
            newRecognition.onerror = (event: any) => {
              console.error("Speech recognition error:", event.error);
              setIsRecording(false);
            };
            newRecognition.onend = () => {
              setIsRecording(false);
            };
            
            newRecognition.start();
          }
        } catch (reinitError) {
          console.error("Error reinitializing speech recognition:", reinitError);
        }
      }
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, lastUserMessage.images || []);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <div className="flex-shrink-0 sticky top-0 z-40 bg-background border-b border-border">
          <ChatHeader
            currentModel={currentModel}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="w-full px-4 py-4 md:py-6">
              <div className="max-w-2xl mx-auto">
                {messages.length === 0 ? (
                  <WelcomeScreen
                    onSuggestionClick={(prompt) => handleSendMessage(prompt, [])}
                  />
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isUser={message.role === "user"}
                        userName={userName}
                        userAvatar={userAvatar}
                        onSpeak={voiceEnabled ? speakText : undefined}
                        onRegenerate={
                          message.role === "assistant" &&
                          message.id === messages[messages.length - 1]?.id
                            ? handleRegenerate
                            : undefined
                        }
                        onEdit={
                          message.role === "user"
                            ? (id, content) =>
                                useChatStore.getState().updateMessage(id, content)
                            : undefined
                        }
                      />
                    ))}
                    {isGenerating && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>
          </div>

          {showScrollButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-20 left-4 rounded-full shadow-lg z-10 hover:scale-110 transition-transform"
              onClick={scrollToBottom}
              data-testid="button-scroll-down"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="flex-shrink-0 sticky bottom-0 z-40 bg-background border-t border-border">
          <ChatInput
            onSend={handleSendMessage}
            isGenerating={isGenerating}
            attachedImages={attachedImages}
            onAddImage={addImage}
            onRemoveImage={removeImage}
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
          />
        </div>
      </main>

      <VoiceRecordingOverlay
        isRecording={isRecording}
        onStop={handleToggleRecording}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaveProfile={handleSaveProfile}
        currentName={userName}
        currentAvatar={userAvatar}
        currentPersonality={userPersonality}
      />
    </div>
  );
}
