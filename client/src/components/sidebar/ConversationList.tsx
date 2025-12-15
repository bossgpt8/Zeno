import { MessageSquare, Trash2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  title: string;
  pinned?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentId,
  onSelect,
  onDelete,
  onTogglePin,
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

  const pinnedConversations = conversations.filter(c => c.pinned);
  const unpinnedConversations = conversations.filter(c => !c.pinned);

  return (
    <div className="space-y-1">
      {pinnedConversations.length > 0 && (
        <>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1">
            Pinned
          </div>
          {pinnedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === currentId}
              onSelect={onSelect}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
          {unpinnedConversations.length > 0 && (
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1 mt-2">
              Recent
            </div>
          )}
        </>
      )}
      {unpinnedConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === currentId}
          onSelect={onSelect}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary" 
          : "text-muted-foreground hover-elevate"
      }`}
      onClick={() => onSelect(conversation.id)}
      data-testid={`conversation-${conversation.id}`}
    >
      {conversation.pinned && (
        <Pin className="w-3 h-3 flex-shrink-0 text-primary" />
      )}
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-sm truncate">
        {conversation.title || "New Chat"}
      </span>
      
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(conversation.id);
          }}
          title={conversation.pinned ? "Unpin" : "Pin"}
          data-testid={`button-pin-conversation-${conversation.id}`}
        >
          <Pin className={`w-3 h-3 ${conversation.pinned ? "text-primary" : ""}`} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          data-testid={`button-delete-conversation-${conversation.id}`}
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
