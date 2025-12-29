import { useState, useEffect, useRef } from "react";
import { Copy, Check, Volume2, ChevronLeft, ChevronRight, RotateCcw, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@shared/schema";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import bossaiRobot from "@assets/bossai-robot.png";
import avatar1 from "@assets/stock_images/astronaut_avatar_nas_d6106021.jpg";
import avatar2 from "@assets/stock_images/astronaut_avatar_nas_bc39255e.jpg";
import avatar3 from "@assets/stock_images/astronaut_avatar_nas_d931e821.jpg";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  userName?: string;
  userAvatar?: string;
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  branchCount?: number;
  currentBranch?: number;
  onBranchChange?: (index: number) => void;
}

const AVATAR_IMAGES: { [key: string]: string } = {
  "avatar-1": avatar1,
  "avatar-2": avatar2,
  "avatar-3": avatar3,
};

export function MessageBubble({
  message,
  isUser,
  userName = "User",
  userAvatar = "avatar-1",
  onSpeak,
  onRegenerate,
  onEdit,
  branchCount = 1,
  currentBranch = 0,
  onBranchChange,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (isUser) {
        setRenderedContent(DOMPurify.sanitize(message.content));
        return;
      }

      marked.setOptions({
        highlight: (code, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
      });

      const html = await marked.parse(message.content);
      setRenderedContent(DOMPurify.sanitize(html));
    };

    renderMarkdown();
  }, [message.content, isUser]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit();
    }
  };

  return (
    <div 
      className={`group mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`message-${message.id}`}
    >
      <div className={`flex items-end gap-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {isUser ? (
            <img 
              src={AVATAR_IMAGES[userAvatar] || avatar1}
              alt={userName}
              className="w-full h-full object-cover"
              data-testid="img-user-avatar"
            />
          ) : (
            <img 
              src={bossaiRobot} 
              alt="BossAI" 
              className="w-full h-full object-cover"
              data-testid="img-bossai-avatar"
            />
          )}
        </div>
        
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={`rounded-2xl px-4 py-2 ${
            isUser 
              ? "bg-primary text-primary-foreground rounded-br-none" 
              : "bg-muted text-foreground rounded-bl-none"
          }`}>
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Attached ${i + 1}`}
                    className="max-w-[150px] max-h-[150px] rounded-lg object-cover cursor-pointer"
                    onClick={() => window.open(img, "_blank")}
                    data-testid={`image-attachment-${i}`}
                  />
                ))}
              </div>
            )}
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] text-sm"
                  data-testid="textarea-edit-message"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editContent === message.content}
                    data-testid="button-save-edit"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                ref={contentRef}
                className="prose prose-sm dark:prose-invert max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
                data-testid="div-message-content"
              />
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isEditing && isUser && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleEdit}
                title="Edit message"
                data-testid="button-edit-message"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            {!isEditing && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleCopy}
                title={copied ? "Copied!" : "Copy message"}
                data-testid="button-copy-message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            )}
            {!isEditing && onSpeak && !isUser && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onSpeak(message.content)}
                title="Speak message"
                data-testid="button-speak-message"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {!isEditing && branchCount > 1 && !isUser && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => onBranchChange?.(Math.max(0, currentBranch - 1))}
                disabled={currentBranch === 0}
                title="Previous response"
                data-testid="button-prev-branch"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <span className="text-xs px-1" data-testid="text-branch-count">
                {currentBranch + 1}/{branchCount}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => onBranchChange?.(Math.min(branchCount - 1, currentBranch + 1))}
                disabled={currentBranch === branchCount - 1}
                title="Next response"
                data-testid="button-next-branch"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}

          {!isEditing && onRegenerate && !isUser && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onRegenerate}
              data-testid="button-regenerate"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
