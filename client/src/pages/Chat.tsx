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
import { VoiceChatModal } from "@/components/chat/VoiceChatModal";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AI_MODELS } from "@shared/schema";
import type { Message } from "@shared/schema";
import { getUserProfile, getConversations, saveConversation } from "@/lib/firebase";

// Helper function to fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs: number = 60000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout - no internet connection or server not responding")), timeoutMs)
    ),
  ]);
};

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
    thinkingEnabled,
    searchEnabled,
    isGenerating,
    attachedImages,
    voiceEnabled,
    isRecording,
    sidebarOpen,
    customSystemPrompt,
    hasSeenOnboarding,
    hasSeenSettings,
    hasSeenProfile,
    hasSeenAuthPrompt,
    hasSeenTutorial,
    setHasSeenOnboarding,
    setHasSeenSettings,
    setHasSeenProfile,
    setHasSeenAuthPrompt,
    setHasSeenTutorial,
    setUserName,
    setUserAvatar,
    setUserPersonality,
    setUserGender,
    setIsGenerating,
    setConversations,
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
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  // Load user profile and conversations from Firestore on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          // Load Profile
          const profile = await getUserProfile(user.uid);
          if (profile) {
            if (profile.userName) setUserName(profile.userName);
            if (profile.userAvatar) setUserAvatar(profile.userAvatar);
            if (profile.userPersonality) setUserPersonality(profile.userPersonality);
            if (profile.userGender) setUserGender(profile.userGender);
          }

          // Load Conversations
          const cloudConversations = await getConversations(user.uid);
          if (cloudConversations.length > 0) {
            // Merge or replace local conversations
            setConversations(cloudConversations as any);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };
    
    loadUserData();
  }, [user?.uid, setUserName, setUserAvatar, setUserPersonality, setUserGender, setConversations]);

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

  // Prompt for auth on first visit if not signed in
  useEffect(() => {
    if (!user && !hasSeenAuthPrompt && hasSeenOnboarding && hasSeenProfile) {
      const timer = setTimeout(() => {
        setSidebarOpen(true);
        // We'll need a way to trigger the auth modal from here
        // For now, opening the sidebar will show the "Sign In" button
        // But we can improve this by adding a state to open the auth modal directly
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenAuthPrompt, hasSeenOnboarding, hasSeenProfile, setSidebarOpen]);

  useEffect(() => {
    if (!hasSeenTutorial && hasSeenAuthPrompt) {
      const timer = setTimeout(() => {
        // Only show tutorial if not currently in another modal
        if (!showOnboarding && !showProfileModal) {
          // tutorial component handles its own visibility based on hasSeenTutorial
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, hasSeenAuthPrompt, showOnboarding, showProfileModal]);

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
            title: "I didn't quite catch that",
            description: "I couldn't hear you clearly. Could you try speaking again?",
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

    // Sync to Firestore if signed in
    if (user?.uid && conversationId) {
      setTimeout(() => {
        const currentConversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
        if (currentConversation) {
          saveConversation(user.uid, conversationId, currentConversation).catch(console.error);
        }
      }, 0);
    }

    // Generate AI title if first message
    if (messages.length === 0 && !isImageModel(currentModel)) {
      (async () => {
        try {
          const titleResponse = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: "Generate a very short, 2-4 word descriptive title for this conversation based on the user's message. Return ONLY the title text, no quotes or punctuation." },
                { role: "user", content: content }
              ],
              model: currentModel,
              max_tokens: 10
            }),
          });
          if (titleResponse.ok) {
            const reader = titleResponse.body?.getReader();
            const decoder = new TextDecoder();
            let aiTitle = "";
            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.content) aiTitle += data.content;
                    } catch {}
                  }
                }
              }
              if (aiTitle.trim()) {
                updateConversationTitle(conversationId, aiTitle.trim());
              }
            }
          }
        } catch (error) {
          console.error("Error generating AI title:", error);
          const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          updateConversationTitle(conversationId, title);
        }
      })();
    } else if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      updateConversationTitle(conversationId, title);
    }

    setIsGenerating(true);

    try {
      // Check if using image generation model
      if (isImageModel(currentModel)) {
        const response = await fetchWithTimeout("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: content, modelId: currentModel }),
        }, 60000);

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

        // Sync assistant response to Firestore
        if (user?.uid && conversationId) {
          const currentConversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
          if (currentConversation) {
            saveConversation(user.uid, conversationId, currentConversation).catch(console.error);
          }
        }

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

        const response = await fetchWithTimeout("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            model: currentModel,
            customPrompt: customSystemPrompt,
            userName,
            userGender,
            enableWebSearch: searchEnabled,
            thinkingEnabled: thinkingEnabled,
            memories: useChatStore.getState().memories.map(m => m.content),
          }),
        }, 180000);

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

        // Sync assistant message skeleton to Firestore
        if (user?.uid && conversationId) {
          const currentConversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
          if (currentConversation) {
            saveConversation(user.uid, conversationId, currentConversation).catch(console.error);
          }
        }

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

            // Sync full streaming content to Firestore
            if (user?.uid && conversationId) {
              const currentConversation = useChatStore.getState().conversations.find(c => c.id === conversationId);
              if (currentConversation) {
                saveConversation(user.uid, conversationId, currentConversation).catch(console.error);
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
      let errorTitle = "Something went wrong";
      let errorDescription = "I ran into a bit of trouble getting that response for you. Let's try again?";
      
      // Handle timeout errors
      if (error.message.includes("timeout") || error.message.includes("no internet")) {
        errorTitle = "Connection lost";
        errorDescription = "It looks like your internet connection dropped or the server is a bit slow. Please check your connection and try again!";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
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
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {!hasSeenTutorial && hasSeenAuthPrompt && (
          <OnboardingTutorial onComplete={() => setHasSeenTutorial(true)} />
        )}
        <div className="flex-shrink-0 sticky top-0 z-40 bg-background border-b border-border">
          <ChatHeader
            currentModel={currentModel}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setShowVoiceChat(true)}
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
                    {isGenerating && (
                <TypingIndicator 
                  thinkingEnabled={thinkingEnabled} 
                  searchEnabled={searchEnabled} 
                />
              )}
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
      </div>

      <ChatContent 
        showOnboarding={showOnboarding}
        handleCloseOnboarding={handleCloseOnboarding}
        showNameModal={showNameModal}
        setShowNameModal={setShowNameModal}
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        handleSaveProfile={handleSaveProfile}
        showVoiceChat={showVoiceChat}
        setShowVoiceChat={setShowVoiceChat}
        isRecording={isRecording}
        handleToggleRecording={handleToggleRecording}
      />
    </div>
  );
}

function ChatContent({ 
  showOnboarding, 
  handleCloseOnboarding, 
  showNameModal, 
  setShowNameModal, 
  showProfileModal, 
  setShowProfileModal, 
  handleSaveProfile,
  showVoiceChat,
  setShowVoiceChat,
  isRecording,
  handleToggleRecording
}: any) {
  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />

      <NameModal
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSetName={(name) => setUserName(name)}
      />

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaveProfile={handleSaveProfile}
      />

      <VoiceChatModal
        isOpen={showVoiceChat}
        onClose={() => setShowVoiceChat(false)}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
      />
    </>
  );
}
