import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Message } from "@shared/schema";
import type { User } from "firebase/auth";

interface Conversation {
  id: string;
  userId: string | null;
  title: string;
  messages: Message[];
  model: string;
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  userName: string;
  setUserName: (name: string) => void;

  userAvatar: string;
  setUserAvatar: (avatar: string) => void;

  userPersonality: string;
  setUserPersonality: (personality: string) => void;
  
  userGender: string;
  setUserGender: (gender: string) => void;
  
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  
  hasSeenSettings: boolean;
  setHasSeenSettings: (seen: boolean) => void;

  hasSeenProfile: boolean;
  setHasSeenProfile: (seen: boolean) => void;
  
  hasSeenAuthPrompt: boolean;
  setHasSeenAuthPrompt: (seen: boolean) => void;

  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;

  hasAcceptedLocalStorage: boolean;
  setHasAcceptedLocalStorage: (accepted: boolean) => void;
  
  conversations: Conversation[];
  currentConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  
  currentBranchPath: Map<string, number>;
  setBranchIndex: (messageId: string, branchIndex: number) => void;
  getActiveBranch: () => Message[];
  
  currentModel: string;
  setCurrentModel: (model: string) => void;
  
  thinkingEnabled: boolean;
  setThinkingEnabled: (enabled: boolean) => void;
  
  searchEnabled: boolean;
  setSearchEnabled: (enabled: boolean) => void;
  
  customSystemPrompt: string;
  setCustomSystemPrompt: (prompt: string) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  attachedImages: string[];
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  memories: { id: string; content: string }[];
  addMemory: (content: string) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, content: string) => void;
  
  createNewConversation: () => string;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  getFilteredConversations: () => Conversation[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      
      userName: "User",
      setUserName: (name) => {
        // Validate name to prevent corruption
        const cleanName = (name || "").trim().slice(0, 100);
        if (cleanName && !cleanName.includes("timeout") && !cleanName.includes("stuff")) {
          set({ userName: cleanName || "User" });
        } else {
          set({ userName: "User" });
        }
      },

      userAvatar: "avatar-1",
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),

      userPersonality: "friendly",
      setUserPersonality: (personality) => set({ userPersonality: personality }),
      
      userGender: "",
      setUserGender: (gender) => set({ userGender: gender }),
      
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      
      hasSeenSettings: false,
      setHasSeenSettings: (seen) => set({ hasSeenSettings: seen }),

      hasSeenProfile: false,
      setHasSeenProfile: (seen) => set({ hasSeenProfile: seen }),
      
      hasSeenAuthPrompt: false,
      setHasSeenAuthPrompt: (seen) => set({ hasSeenAuthPrompt: seen }),

      hasSeenTutorial: false,
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),

      hasAcceptedLocalStorage: false,
      setHasAcceptedLocalStorage: (accepted) => set({ hasAcceptedLocalStorage: accepted }),
      
      conversations: [],
      currentConversationId: null,
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversationId: (id) => {
        const conversation = get().conversations.find(c => c.id === id);
        set({ 
          currentConversationId: id,
          messages: conversation?.messages || [],
          currentBranchPath: new Map(),
        });
      },
      
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => {
        const newMessages = [...state.messages, message];
        const updatedConversations = state.conversations.map(c => 
          c.id === state.currentConversationId 
            ? { ...c, messages: newMessages, updatedAt: new Date() }
            : c
        );
        return { messages: newMessages, conversations: updatedConversations };
      }),
      updateMessage: (id, content) => set((state) => {
        const newMessages = state.messages.map(m => 
          m.id === id ? { ...m, content } : m
        );
        const updatedConversations = state.conversations.map(c => 
          c.id === state.currentConversationId 
            ? { ...c, messages: newMessages, updatedAt: new Date() }
            : c
        );
        return { messages: newMessages, conversations: updatedConversations };
      }),
      
      currentBranchPath: new Map(),
      setBranchIndex: (messageId, branchIndex) => set((state) => {
        const newPath = new Map(state.currentBranchPath);
        newPath.set(messageId, branchIndex);
        return { currentBranchPath: newPath };
      }),
      getActiveBranch: () => {
        const { messages, currentBranchPath } = get();
        const result: Message[] = [];
        let currentParentId: string | null = null;
        
        const messagesByParent = new Map<string | null, Message[]>();
        for (const msg of messages) {
          const parentId = msg.parentId ?? null;
          if (!messagesByParent.has(parentId)) {
            messagesByParent.set(parentId, []);
          }
          messagesByParent.get(parentId)!.push(msg);
        }
        
        let currentParent: string | null = null;
        while (true) {
          const children: Message[] = messagesByParent.get(currentParent) || [];
          if (children.length === 0) break;
          
          const branchIndex = currentBranchPath.get(currentParent ?? "root") || 0;
          const selectedChild: Message = children[Math.min(branchIndex, children.length - 1)];
          result.push(selectedChild);
          currentParent = selectedChild.id;
        }
        
        return result;
      },
      
      currentModel: "qwen/qwen-2.5-vl-7b-instruct:free",
      setCurrentModel: (model) => set({ currentModel: model }),
      
      thinkingEnabled: false,
      setThinkingEnabled: (enabled: boolean) => set({ thinkingEnabled: enabled }),
      
      searchEnabled: false,
      setSearchEnabled: (enabled: boolean) => set({ searchEnabled: enabled }),
      
      customSystemPrompt: "",
      setCustomSystemPrompt: (prompt) => set({ customSystemPrompt: prompt }),
      
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      attachedImages: [],
      addImage: (image) => set((state) => ({ 
        attachedImages: [...state.attachedImages, image] 
      })),
      removeImage: (index) => set((state) => ({
        attachedImages: state.attachedImages.filter((_, i) => i !== index)
      })),
      clearImages: () => set({ attachedImages: [] }),
      voiceEnabled: false,
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      isRecording: false,
      setIsRecording: (recording) => set({ isRecording: recording }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      memories: [],
      addMemory: (content) => set((state) => ({
        memories: [...state.memories, { id: nanoid(), content }]
      })),
      deleteMemory: (id) => set((state) => ({
        memories: state.memories.filter(m => m.id !== id)
      })),
      updateMemory: (id, content) => set((state) => ({
        memories: state.memories.map(m => m.id === id ? { ...m, content } : m)
      })),
      
      createNewConversation: () => {
        const id = nanoid();
        const newConversation: Conversation = {
          id,
          userId: get().user?.uid || null,
          title: "New Chat",
          messages: [],
          model: get().currentModel,
          pinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          messages: [],
          currentBranchPath: new Map(),
        }));
        return id;
      },
      deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter(c => c.id !== id);
        const isCurrentDeleted = state.currentConversationId === id;
        return {
          conversations: newConversations,
          currentConversationId: isCurrentDeleted 
            ? (newConversations[0]?.id || null) 
            : state.currentConversationId,
          messages: isCurrentDeleted 
            ? (newConversations[0]?.messages || []) 
            : state.messages,
        };
      }),
      updateConversationTitle: (id, title) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id ? { ...c, title } : c
        ),
      })),
      togglePinConversation: (id) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id ? { ...c, pinned: !c.pinned } : c
        ),
      })),
      getFilteredConversations: () => {
        const { conversations, searchQuery } = get();
        if (!searchQuery.trim()) {
          return [...conversations].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
        }
        const query = searchQuery.toLowerCase();
        return conversations
          .filter(c => 
            c.title.toLowerCase().includes(query) ||
            c.messages.some(m => m.content.toLowerCase().includes(query))
          )
          .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
      },
    }),
    {
      name: "zeno-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        currentModel: state.currentModel,
        thinkingEnabled: state.thinkingEnabled,
        searchEnabled: state.searchEnabled,
        voiceEnabled: state.voiceEnabled,
        customSystemPrompt: state.customSystemPrompt,
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenSettings: state.hasSeenSettings,
        hasSeenProfile: state.hasSeenProfile,
        hasSeenAuthPrompt: state.hasSeenAuthPrompt,
        hasSeenTutorial: state.hasSeenTutorial,
        hasAcceptedLocalStorage: state.hasAcceptedLocalStorage,
        userName: state.userName,
        userAvatar: state.userAvatar,
        userPersonality: state.userPersonality,
        userGender: state.userGender,
        memories: state.memories,
      }),
    }
  )
);
