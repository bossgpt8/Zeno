import { useEffect, useRef, useCallback, useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDown, Download } from "lucide-react";
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
    addMemory,
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
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

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

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => setShowInstallPrompt(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowInstallPrompt(false);
  };

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
        // Only set sidebar open if it's not already open to avoid potential loops
        setSidebarOpen(true);
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

  const getActiveBranch = useCallback(() => {
    return messages;
  }, [messages]);

  const handleSendMessage = async (content: string, images: string[]) => {
    if (!content.trim() && images.length === 0) return;

    // Smart Model Switching
    let modelToUse = currentModel;
    
    // 1. If images are attached, switch to Qwen 2.5 VL for analysis
    if (images.length > 0) {
      modelToUse = "qwen/qwen-2.5-vl-7b-instruct:free";
      useChatStore.getState().setCurrentModel(modelToUse);
      toast({
        description: "Switched to Qwen 2.5 VL for image analysis. 👁️✨",
      });
    } 
    // 2. If keywords like "create image" or "generate image" are used, switch to FLUX
    else if (content.toLowerCase().match(/generate (an )?image|create (an )?image|draw|paint|make an image/i)) {
      modelToUse = "black-forest-labs/FLUX.1-schnell";
      
      // Enhance prompt with context if referring to a previous image
      const isRefining = /change|modify|make it|add|remove|instead|more|less/i.test(content);
      if (isRefining) {
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant" && m.content.includes("![Generated Image]"));
        const lastUserMessage = [...messages].reverse().find(m => m.role === "user" && m.content.toLowerCase().match(/generate|create|make|draw|paint/i));
        
        if (lastUserMessage) {
          content = `Based on the previous image described as "${lastUserMessage.content}", please: ${content}`;
        }
      }

      useChatStore.getState().setCurrentModel(modelToUse);
      toast({
        description: "Switched to FLUX.1 for image generation. 🎨✨",
      });
    }

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

    // Simple heuristic to extract names from messages like "my name is Israel"
    const nameMatch = content.match(/my name is ([a-zA-Z\s]+)/i);
    if (nameMatch && nameMatch[1]) {
      const detectedName = nameMatch[1].trim();
      if (detectedName.length < 50) {
        setUserName(detectedName);
        addMemory(`The user's name is ${detectedName}`);
        toast({
          title: "Added to memory",
          description: `I'll remember that your name is ${detectedName}.`,
        });
      }
    } else if (content.toLowerCase().includes("i am") || content.toLowerCase().includes("remember that")) {
      // General memory capture for other info
      addMemory(content);
      toast({
        title: "Added to memory",
        description: "I've saved this information to my memory.",
      });
    }

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

    const maxRetries = 3;
    let attempt = 1;
    let success = false;

    while (attempt <= maxRetries && !success) {
      setIsGenerating(true);
      try {
        if (attempt > 1) {
          toast({
            title: `Retry Attempt ${attempt - 1}`,
            description: `Retrying to get a response (Attempt ${attempt}/${maxRetries})...`,
          });
        }

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
          success = true;
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
                  const line = lines[i].trim();
                  if (!line || !line.startsWith("data: ")) continue;

                  const dataString = line.slice(6).trim();
                  if (dataString === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(dataString);
                    const content = parsed.content || parsed.choices?.[0]?.delta?.content || "";
                    if (content) {
                      fullContent += content;
                      updateMessage(assistantMessage.id, fullContent);
                    }
                  } catch (e) {
                    // If it's not valid JSON, it might be the raw content if OpenRouter relayed it differently
                    // but we should stick to the data: JSON format
                  }
                }
                buffer = lines[lines.length - 1];
              }
              
              // Handle last bit of buffer
              if (buffer.trim().startsWith("data: ")) {
                const dataString = buffer.trim().slice(6).trim();
                if (dataString && dataString !== "[DONE]") {
                  try {
                    const parsed = JSON.parse(dataString);
                    const content = parsed.content || parsed.choices?.[0]?.delta?.content || "";
                    if (content) {
                      fullContent += content;
                      updateMessage(assistantMessage.id, fullContent);
                    }
                  } catch (e) {}
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
          success = true;
        }
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          let errorTitle = "Connection error";
          let errorDescription = "I've tried 3 times but still can't get a response. Please check your internet connection and try again later.";
          
          if (error.message.includes("timeout")) {
            errorTitle = "Request timed out";
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive",
          });
        }
        
        attempt++;
        if (attempt <= maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } finally {
        if (success || attempt > maxRetries) {
          setIsGenerating(false);
        }
      }
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

  const handleEditMessage = (id: string, content: string) => {
    updateMessage(id, content);
  };

  const handleImageEdit = (imageUrl: string) => {
    addImage(imageUrl);
    toast({
      description: "Image added to your next message for editing.",
    });
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
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onStartTutorial={() => {
          setForceShowTutorial(true);
          setSidebarOpen(false);
        }}
      />

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {user && hasSeenOnboarding && (!hasSeenTutorial || forceShowTutorial) && (
          <OnboardingTutorial onComplete={() => {
            setHasSeenTutorial(true);
            setForceShowTutorial(false);
          }} />
        )}

        {/* PWA Install Prompt */}
        {showInstallPrompt && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-card/95 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Install Zeno AI</h3>
                <p className="text-xs text-muted-foreground truncate">Add Zeno to your home screen for a better experience! 📱✨</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={handleInstallApp} className="h-8 text-xs font-medium px-4">
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowInstallPrompt(false)} className="h-7 text-[10px] text-muted-foreground font-normal hover:bg-transparent px-0">
                  Not now
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-shrink-0 sticky top-0 z-40 bg-background border-b border-border">
          <ChatHeader
            currentModel={currentModel}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setShowVoiceChat(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="w-full px-4 py-4 md:py-8">
              <div className="max-w-3xl mx-auto min-h-full flex flex-col">
                {messages.length === 0 ? (
                  <WelcomeScreen
                    onSuggestionClick={(prompt) => handleSendMessage(prompt, [])}
                  />
                ) : (
                  <div className="space-y-6 pb-32">
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
                          message.id === getActiveBranch()[getActiveBranch().length - 1]?.id
                            ? handleRegenerate
                            : undefined
                        }
                        onEdit={
                          message.role === "user"
                            ? (id, content) =>
                                useChatStore.getState().updateMessage(id, content)
                            : undefined
                        }
                        onImageEdit={handleImageEdit}
                      />
                    ))}
                    {isGenerating && (
                      <TypingIndicator 
                        thinkingEnabled={thinkingEnabled} 
                        searchEnabled={searchEnabled} 
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {showScrollButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-32 right-4 md:right-8 rounded-full shadow-lg z-10 hover:scale-110 transition-transform border border-border/50"
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
        setUserName={setUserName}
        onStartTutorial={() => {
          setForceShowTutorial(true);
          setSidebarOpen(false);
        }}
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
  handleToggleRecording,
  setUserName,
  onStartTutorial
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

      <AppSidebar 
        isOpen={false} 
        onClose={() => {}} 
        onStartTutorial={onStartTutorial}
      />
    </>
  );
}
