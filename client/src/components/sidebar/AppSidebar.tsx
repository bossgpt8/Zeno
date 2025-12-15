import { Zap, Plus, User, LogOut, Search, Settings, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConversationList } from "./ConversationList";
import { ModelSelector } from "./ModelSelector";
import { useChatStore } from "@/lib/store";
import { isFirebaseConfigured, signInWithGoogle, signOutUser } from "@/lib/firebase";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const {
    user,
    currentConversationId,
    currentModel,
    searchQuery,
    customSystemPrompt,
    setCurrentConversationId,
    setCurrentModel,
    setSearchQuery,
    setCustomSystemPrompt,
    createNewConversation,
    deleteConversation,
    togglePinConversation,
    getFilteredConversations,
  } = useChatStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(customSystemPrompt);

  const conversations = getFilteredConversations();

  const handleNewChat = () => {
    createNewConversation();
    onClose();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    onClose();
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSaveSystemPrompt = () => {
    setCustomSystemPrompt(tempPrompt);
    setSettingsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside
        className={`w-72 bg-sidebar border-r border-sidebar-border flex flex-col fixed lg:relative inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        data-testid="sidebar"
      >
        <div className="p-4 md:p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <span className="text-base md:text-lg font-bold text-sidebar-foreground">BossAI</span>
          </div>
          
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 mb-3"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
              data-testid="input-search-chats"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">
            {searchQuery ? "Search Results" : "Chats"}
          </div>
          <ConversationList
            conversations={conversations}
            currentId={currentConversationId}
            onSelect={handleSelectConversation}
            onDelete={deleteConversation}
            onTogglePin={togglePinConversation}
          />
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          {user ? (
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-card-border">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium truncate text-foreground">
                {user.displayName || user.email || "User"}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSignOut}
                className="flex-shrink-0"
                data-testid="button-sign-out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : isFirebaseConfigured ? (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSignIn}
              data-testid="button-sign-in"
            >
              <User className="w-4 h-4" />
              Sign In / Register
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground text-center p-2">
              Chats saved locally
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              <ModelSelector value={currentModel} onChange={setCurrentModel} />
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => setTempPrompt(customSystemPrompt)}
                  data-testid="button-settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Custom Instructions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">Custom System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      placeholder="Add custom instructions for how BossAI should respond..."
                      value={tempPrompt}
                      onChange={(e) => setTempPrompt(e.target.value)}
                      className="min-h-[150px]"
                      data-testid="textarea-system-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be added to every conversation to customize AI responses.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setSettingsOpen(false)}
                      data-testid="button-cancel-settings"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveSystemPrompt}
                      data-testid="button-save-settings"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </aside>
    </>
  );
}
