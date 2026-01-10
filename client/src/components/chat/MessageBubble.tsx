import { useState, useEffect, useRef } from "react";
import { Copy, Check, Volume2, ChevronLeft, ChevronRight, RotateCcw, Pencil, X, Download, Image as ImageIcon, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message } from "@shared/schema";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import zenoLogo from "@assets/image_1767364441563.png";
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
  onImageEdit?: (imageUrl: string) => void;
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
  onImageEdit,
  branchCount = 1,
  currentBranch = 0,
  onBranchChange,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const renderMarkdown = async () => {
      // Extract images from markdown
      const imgRegex = /!\[.*?\]\((.*?)\)/g;
      const urls: string[] = [];
      let match;
      while ((match = imgRegex.exec(message.content)) !== null) {
        urls.push(match[1]);
      }
      setImageUrls(urls);

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

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `zeno-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className={`flex items-start gap-4 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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
              src={zenoLogo} 
              alt="Zeno" 
              className="w-full h-full object-cover"
              data-testid="img-zeno-avatar"
            />
          )}
        </div>
        
        <div className={`flex flex-col flex-1 min-w-0 ${isUser ? "items-end" : "items-start"}`}>
          <div className={isUser 
            ? "rounded-2xl px-5 py-3 border bg-muted/50 text-foreground rounded-br-none border-border/50 shadow-sm max-w-[85%]" 
            : "rounded-2xl px-5 py-3 border bg-muted/30 text-foreground rounded-bl-none border-border/50 w-full overflow-hidden"
          }>
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.images.map((img, i) => (
                  <div key={i} className="relative group/img">
                    <img
                      src={img}
                      alt={`Attached ${i + 1}`}
                      className="max-w-[150px] max-h-[150px] rounded-lg object-cover cursor-pointer border-2 border-current"
                      onClick={() => window.open(img, "_blank")}
                      data-testid={`image-attachment-${i}`}
                    />
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(img);
                        }}
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageEdit?.(img);
                        }}
                        title="Edit"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isEditing ? (
              <div className="space-y-2 w-full min-w-[300px] md:min-w-[450px]">
                <Textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[150px] w-full text-base border-2 p-4 font-black rounded-3xl backdrop-blur-md bg-background/20"
                  data-testid="textarea-edit-message"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full hover:bg-background/40"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="font-black rounded-full px-6"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editContent === message.content}
                    data-testid="button-save-edit"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  ref={contentRef}
                  className="prose prose-base dark:prose-invert max-w-none break-words text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                  data-testid="div-message-content"
                />
                {!isUser && imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] rounded-full font-bold bg-background/50 backdrop-blur-sm"
                          onClick={() => handleDownload(url)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] rounded-full font-bold bg-background/50 backdrop-blur-sm"
                          onClick={() => onImageEdit?.(url)}
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isEditing && !isUser && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy message"}
                  data-testid="button-copy-message"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  title="Good response"
                  data-testid="button-like-message"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  title="Bad response"
                  data-testid="button-dislike-message"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  title="Share"
                  data-testid="button-share-message"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
                {onRegenerate && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onRegenerate}
                    title="Regenerate"
                    data-testid="button-regenerate-icon"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                      title="More"
                      data-testid="button-more-actions"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {onSpeak && (
                      <DropdownMenuItem onClick={() => onSpeak(message.content)}>
                        <Volume2 className="w-4 h-4 mr-2" />
                        <span>Read aloud</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="w-4 h-4 mr-2" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GitBranch className="w-4 h-4 mr-2" />
                      <span>Branch in new chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isEditing && isUser && (
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleEdit}
                  title="Edit message"
                  data-testid="button-edit-message"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy message"}
                  data-testid="button-copy-message-user"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            )}
            
            {!isEditing && onSpeak && !isUser && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onSpeak(message.content)}
                title="Speak message"
                data-testid="button-speak-message"
              >
                <Volume2 className="w-3.5 h-3.5" />
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

        </div>
      </div>
    </div>
  );
}
