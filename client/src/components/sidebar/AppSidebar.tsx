import { Zap, Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationList } from "./ConversationList";
import { ModelSelector } from "./ModelSelector";
import { useChatStore } from "@/lib/store";
import { isFirebaseConfigured, signInWithGoogle, signOutUser } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const {
    user,
    conversations,
    currentConversationId,
    currentModel,
    setCurrentConversationId,
    setCurrentModel,
    createNewConversation,
    deleteConversation,
  } = useChatStore();

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
            className="w-full gap-2"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">
            Recent Chats
          </div>
          <ConversationList
            conversations={conversations}
            currentId={currentConversationId}
            onSelect={handleSelectConversation}
            onDelete={deleteConversation}
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
          
          <ModelSelector value={currentModel} onChange={setCurrentModel} />
        </div>
      </aside>
    </>
  );
}
