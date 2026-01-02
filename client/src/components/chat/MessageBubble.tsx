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
import avatar1 from "@assets/image_1767059069765.png";
import avatar2 from "@assets/image_1767059090978.png";
import avatar3 from "@assets/image_1767059124279.png";
import avatar4 from "@assets/image_1767059177424.png";
import avatar5 from "@assets/image_1767059193731.png";
import avatar6 from "@assets/image_1767059240340.png";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  userName?: string;
  userAvatar?: string;
  photoURL?: string | null;
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
  "avatar-4": avatar4,
  "avatar-5": avatar5,
  "avatar-6": avatar6,
};

export function MessageBubble({
  message,
  isUser,
  userName = "User",
  userAvatar = "avatar-1",
  photoURL,
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
        gfm: true,
        breaks: true,
      });

      const html = await marked.parse(message.content, {
        async: true,
        highlight: (code: string, lang: string) => {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
      } as any);
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

  useEffect(() => {
    if (!contentRef.current || isEditing) return;

    const preElements = contentRef.current.querySelectorAll("pre");
    
    preElements.forEach((pre) => {
      // Only add if copy button doesn't already exist
      if (pre.querySelector(".copy-btn")) return;

      const button = document.createElement("button");
      button.className = "copy-btn";
      button.textContent = "Copy";
      button.type = "button";
      button.setAttribute("data-testid", "button-copy-code");

      button.addEventListener("click", async (e) => {
        e.preventDefault();
        // Get all text content except the button
        let code = "";
        const children = Array.from(pre.childNodes);
        children.forEach((node) => {
          if (node !== button) {
            if (node.nodeType === Node.TEXT_NODE) {
              code += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && node !== button) {
              code += (node as Element).textContent;
            }
          }
        });
        
        try {
          await navigator.clipboard.writeText(code);
          const originalText = button.textContent;
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        } catch (error) {
          console.error("Failed to copy code:", error);
        }
      });

      pre.style.position = "relative";
      pre.appendChild(button);
    });
  }, [renderedContent, isEditing]);

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
      className={`group mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300 flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`message-${message.id}`}
    >
      <div className={`flex items-start gap-4 max-w-2xl ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-muted">
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
              alt="Zeno" 
              className="w-full h-full object-cover"
              data-testid="img-bossai-avatar"
            />
          )}
        </div>
        
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={isUser 
            ? "rounded-2xl px-5 py-3 border-2 bg-primary text-primary-foreground rounded-br-none border-primary-foreground/30" 
            : ""
          }>
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Attached ${i + 1}`}
                    className="max-w-[150px] max-h-[150px] rounded-lg object-cover cursor-pointer border-2 border-current"
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
                  className="min-h-[100px] text-base border-2"
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
                className="prose prose-base dark:prose-invert max-w-none break-words text-base leading-relaxed"
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
