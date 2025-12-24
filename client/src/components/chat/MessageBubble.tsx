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

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  userName?: string;
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  branchCount?: number;
  currentBranch?: number;
  onBranchChange?: (index: number) => void;
}

export function MessageBubble({
  message,
  isUser,
  userName = "User",
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

      const html = await marked(message.content);
      setRenderedContent(DOMPurify.sanitize(html));
    };

    renderMarkdown();
  }, [message.content, isUser]);

  useEffect(() => {
    if (contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll("pre");
      codeBlocks.forEach((block) => {
        if (!block.querySelector(".copy-btn")) {
          const btn = document.createElement("button");
          btn.className = "copy-btn";
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
          btn.onclick = () => {
            const code = block.querySelector("code")?.textContent || "";
            navigator.clipboard.writeText(code);
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
            setTimeout(() => {
              btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
            }, 2000);
          };
          block.style.position = "relative";
          block.appendChild(btn);
        }
      });
    }
  }, [renderedContent]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditContent(message.content);
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
      className="group mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
      data-testid={`message-${message.id}`}
    >
      <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-3">
        <div 
          className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm md:text-base overflow-hidden ${
            isUser 
              ? "bg-primary text-primary-foreground font-semibold" 
              : "bg-card border border-card-border"
          }`}
        >
          {isUser ? (
            <span>{userName.charAt(0).toUpperCase()}</span>
          ) : (
            <img 
              src={bossaiRobot} 
              alt="BossAI" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-foreground">
                {isUser ? userName : "BossAI"}
              </span>
              {isUser && <span className="text-xs text-muted-foreground">(you)</span>}
            </div>
            
            {branchCount > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6"
                  onClick={() => onBranchChange?.(Math.max(0, currentBranch - 1))}
                  disabled={currentBranch === 0}
                  data-testid="button-branch-prev"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Badge variant="secondary" className="text-xs px-2">
                  {currentBranch + 1}/{branchCount}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6"
                  onClick={() => onBranchChange?.(Math.min(branchCount - 1, currentBranch + 1))}
                  disabled={currentBranch === branchCount - 1}
                  data-testid="button-branch-next"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isUser && onEdit && !isEditing && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 md:w-8 md:h-8"
                  onClick={handleStartEdit}
                  data-testid="button-edit-message"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 md:w-8 md:h-8"
                onClick={handleCopy}
                data-testid="button-copy-message"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              
              {!isUser && onSpeak && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 md:w-8 md:h-8"
                  onClick={() => onSpeak(message.content)}
                  data-testid="button-speak-message"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </Button>
              )}
              
              {!isUser && onRegenerate && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 md:w-8 md:h-8"
                  onClick={onRegenerate}
                  data-testid="button-regenerate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {message.images && message.images.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3 pl-11 md:pl-[52px] mb-2 md:mb-3">
          {message.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Attached ${i + 1}`}
              className="max-w-[200px] md:max-w-[250px] max-h-[200px] md:max-h-[250px] rounded-lg object-cover cursor-pointer border border-border"
              onClick={() => window.open(img, "_blank")}
              data-testid={`image-attachment-${i}`}
            />
          ))}
        </div>
      )}
      
      {isEditing ? (
        <div className="pl-11 md:pl-[52px] space-y-2">
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
              variant="outline"
              onClick={handleCancelEdit}
              data-testid="button-cancel-edit"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editContent.trim() || editContent === message.content}
              data-testid="button-save-edit"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save, Escape to cancel
          </p>
        </div>
      ) : (
        <div 
          ref={contentRef}
          className="pl-11 md:pl-[52px] text-sm md:text-[15px] leading-relaxed text-foreground prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-p:text-foreground
            prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic
            prose-img:rounded-xl prose-img:max-w-full
            prose-h1:text-xl prose-h1:font-bold prose-h2:text-lg prose-h2:font-bold prose-h3:text-base prose-h3:font-bold"
          dangerouslySetInnerHTML={{ __html: isUser ? message.content : renderedContent }}
          data-testid="text-message-content"
        />
      )}
    </div>
  );
}
