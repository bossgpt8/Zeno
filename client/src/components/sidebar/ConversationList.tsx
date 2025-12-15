import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@shared/schema";

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isActive = conversation.id === currentId;
        
        return (
          <div
            key={conversation.id}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary" 
                : "text-muted-foreground hover-elevate"
            }`}
            onClick={() => onSelect(conversation.id)}
            data-testid={`conversation-${conversation.id}`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">
              {conversation.title || "New Chat"}
            </span>
            
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              data-testid={`button-delete-conversation-${conversation.id}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
