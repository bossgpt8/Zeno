import { useState, useEffect, useRef } from "react";
import { Copy, Check, Volume2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@shared/schema";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  branchCount?: number;
  currentBranch?: number;
  onBranchChange?: (index: number) => void;
}

export function MessageBubble({
  message,
  isUser,
  onSpeak,
  onRegenerate,
  branchCount = 1,
  currentBranch = 0,
  onBranchChange,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
      data-testid={`message-${message.id}`}
    >
      <div className="flex items-start gap-3 md:gap-4 mb-2 md:mb-3">
        <div 
          className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm md:text-base ${
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-card border border-card-border text-foreground"
          }`}
        >
          {isUser ? "You" : "AI"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <span className="text-sm font-semibold text-foreground">
              {isUser ? "You" : "BossAI"}
            </span>
            
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
      
      <div 
        ref={contentRef}
        className="pl-11 md:pl-[52px] text-sm md:text-[15px] leading-relaxed text-foreground/90 prose prose-invert prose-sm max-w-none
          prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic
          prose-img:rounded-xl prose-img:max-w-full"
        dangerouslySetInnerHTML={{ __html: isUser ? message.content : renderedContent }}
        data-testid="text-message-content"
      />
    </div>
  );
}
