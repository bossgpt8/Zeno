import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Message, Conversation } from "@shared/schema";
import type { User } from "firebase/auth";

interface ChatState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  
  // Messages for current conversation
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  
  // Branching
  currentBranchPath: Map<string, number>;
  setBranchIndex: (messageId: string, branchIndex: number) => void;
  getActiveBranch: () => Message[];
  
  // Model selection
  currentModel: string;
  setCurrentModel: (model: string) => void;
  
  // UI state
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
  
  // Conversation management
  createNewConversation: () => string;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Conversations
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
      
      // Messages
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => {
        const newMessages = [...state.messages, message];
        // Update the current conversation
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
      
      // Branching
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
        
        // Group messages by parentId
        const messagesByParent = new Map<string | null, Message[]>();
        for (const msg of messages) {
          const parentId = msg.parentId ?? null;
          if (!messagesByParent.has(parentId)) {
            messagesByParent.set(parentId, []);
          }
          messagesByParent.get(parentId)!.push(msg);
        }
        
        // Build the active branch
        while (true) {
          const children = messagesByParent.get(currentParentId) || [];
          if (children.length === 0) break;
          
          const branchIndex = currentBranchPath.get(currentParentId ?? "root") || 0;
          const selectedChild = children[Math.min(branchIndex, children.length - 1)];
          result.push(selectedChild);
          currentParentId = selectedChild.id;
        }
        
        return result;
      },
      
      // Model selection
      currentModel: "amazon/nova-2-lite-v1:free",
      setCurrentModel: (model) => set({ currentModel: model }),
      
      // UI state
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
      
      // Conversation management
      createNewConversation: () => {
        const id = nanoid();
        const newConversation: Conversation = {
          id,
          userId: get().user?.uid || null,
          title: "New Chat",
          messages: [],
          model: get().currentModel,
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
    }),
    {
      name: "bossai-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        currentModel: state.currentModel,
        voiceEnabled: state.voiceEnabled,
      }),
    }
  )
);
