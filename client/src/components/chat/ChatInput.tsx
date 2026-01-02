import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string, images: string[]) => void;
  isGenerating: boolean;
  attachedImages: string[];
  onAddImage: (image: string) => void;
  onRemoveImage: (index: number) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isGenerating,
  attachedImages,
  onAddImage,
  onRemoveImage,
  isRecording,
  onToggleRecording,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed && attachedImages.length === 0) return;
    if (isGenerating) return;
    
    onSend(trimmed, attachedImages);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if device is mobile (touch device or small screen)
    const isMobile = window.innerWidth < 768 || 
                     (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 2);
    
    if (e.key === "Enter") {
      if (isMobile) {
        // On mobile: Shift+Enter sends, regular Enter creates new line
        if (e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
        // Allow regular Enter to create new line
      } else {
        // On desktop: Regular Enter sends, Shift+Enter creates new line
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            onAddImage(result);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
              onAddImage(result);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const AudioWaves = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="2" height="4" fill="currentColor" rx="1" />
      <rect x="11" y="7" width="2" height="10" fill="currentColor" rx="1" />
      <rect x="17" y="10" width="2" height="4" fill="currentColor" rx="1" />
    </svg>
  );

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={img}
                  alt={`Attached ${i + 1}`}
                  className="w-20 h-20 md:w-[90px] md:h-[90px] object-cover rounded-lg border-2 border-border"
                  data-testid={`preview-image-${i}`}
                />
                <button
                  onClick={() => onRemoveImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm"
                  data-testid={`button-remove-image-${i}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2 md:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isGenerating}
            className="flex-shrink-0"
            data-testid="button-attach-image"
          >
            <ImagePlus className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative group">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Message BossAI..."
              disabled={disabled || isGenerating}
              className="min-h-[44px] max-h-[200px] resize-none pr-12 text-sm md:text-base transition-all duration-200"
              rows={1}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open('https://replit.com', '_blank')}
            >
              <span className="text-lg font-bold">?</span>
            </Button>
          </div>
          
          <Button
            size="icon"
            onClick={onToggleRecording}
            disabled={disabled || isGenerating}
            className={`flex-shrink-0 h-10 w-10 rounded-full bg-accent hover:opacity-90 text-accent-foreground ${
              isRecording ? "animate-pulse" : ""
            }`}
            data-testid="button-voice-input"
          >
            <AudioWaves />
          </Button>
          
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={disabled || isGenerating || (!message.trim() && attachedImages.length === 0)}
            className="flex-shrink-0"
            data-testid="button-send-message"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
