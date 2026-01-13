import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X, Loader2, Brain, Search, Plus, AudioLines, Image as ImageIcon, Code, BookOpen, GraduationCap, Video, MoreHorizontal, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/lib/store";
import { AI_MODELS } from "@shared/schema";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Puzzle, Plane, Code as CodeIcon, Calendar, Newspaper, Search as SearchIcon, FileText, GraduationCap as GraduationCapIcon, PenTool, Lightbulb } from "lucide-react";

import zenoLogo from "@assets/image_1767364441563.png";

// Common emojis for quick access
const QUICK_EMOJIS = ["😀", "😂", "😍", "🙌", "🔥", "✨", "🚀", "💡", "💯", "✅", "❌", "❓", "👍", "❤️", "🎉", "🌟", "🧠", "💎", "🎨", "🌈"];

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
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, thinkingEnabled, setThinkingEnabled, searchEnabled, setSearchEnabled, setCurrentModel, setSidebarOpen } = useChatStore();

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
    
    // Check if user is trying to send an image but not logged in
    if (!user && attachedImages.length > 0) {
      useChatStore.getState().setHasSeenAuthPrompt(false);
      setSidebarOpen(true);
      return;
    }

    onSend(trimmed, attachedImages);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMobile = window.innerWidth < 768 || 
                     (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 2);
    
    if (e.key === "Enter") {
      if (isMobile) {
        if (e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lock file selection behind sign-in
    if (!user) {
      useChatStore.getState().setHasSeenAuthPrompt(false);
      setSidebarOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            onAddImage(result);
          }
          loadedCount++;
          if (loadedCount === totalFiles) setIsUploading(false);
        };
        reader.onerror = () => {
          loadedCount++;
          if (loadedCount === totalFiles) setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        loadedCount++;
        if (loadedCount === totalFiles) setIsUploading(false);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    let imageFound = false;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        imageFound = true;
        break;
      }
    }

    if (imageFound) {
      setIsUploading(true);
      let processed = 0;
      const totalImages = items.filter(i => i.type.startsWith("image/")).length;

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
              processed++;
              if (processed === totalImages) setIsUploading(false);
            };
            reader.onerror = () => {
              processed++;
              if (processed === totalImages) setIsUploading(false);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  const featureTags = [
    { label: "Image Edit", icon: ImageIcon, model: "qwen/qwen-2.5-vl-7b-instruct:free" },
    { label: "Web Dev", icon: Code, model: "qwen/qwen3-coder:free" },
    { label: "Learn", icon: BookOpen, model: "mistralai/mistral-small-3.1-24b-instruct:free" },
    { label: "Deep Research", icon: GraduationCap, model: "deepseek/deepseek-r1:free" },
    { label: "Image Generation", icon: ImageIcon, model: "black-forest-labs/FLUX.1-schnell" },
    { label: "Video Generation", icon: Video, model: "nvidia/nemotron-nano-12b-v2-vl:free" },
  ];

  const handleTagClick = (modelId: string) => {
    // Check if model is restricted
    const isImageModel = AI_MODELS.image.some(m => m.id === modelId);
    if (isImageModel && !user) {
      useChatStore.getState().setHasSeenAuthPrompt(false);
      setSidebarOpen(true);
      return;
    }
    setCurrentModel(modelId);
  };

  const moreTags = [
    { label: "Artifacts", icon: Puzzle, model: "meta-llama/llama-3.3-70b-instruct:free" },
    { label: "Travel Planner", icon: Plane, model: "mistralai/mistral-small-3.1-24b-instruct:free" },
    { label: "Code", icon: CodeIcon, model: "qwen/qwen3-coder:free" },
    { label: "Make a plan", icon: Calendar, model: "meta-llama/llama-3.1-405b-instruct:free" },
    { label: "News", icon: Newspaper, model: "google/gemma-3-27b-it:free" },
    { label: "Analyze image", icon: SearchIcon, model: "qwen/qwen-2.5-vl-7b-instruct:free" },
    { label: "Summarize text", icon: FileText, model: "mistralai/mistral-small-3.1-24b-instruct:free" },
    { label: "Get advice", icon: GraduationCapIcon, model: "meta-llama/llama-3.3-70b-instruct:free" },
    { label: "Help me write", icon: PenTool, model: "mistralai/mistral-small-3.1-24b-instruct:free" },
    { label: "Brainstorm", icon: Lightbulb, model: "deepseek/deepseek-r1:free" },
  ];

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md p-2 md:p-4 pb-4 md:pb-6">
      <div className="max-w-3xl mx-auto space-y-2 px-2 md:px-0">
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={img}
                  alt={`Attached ${i + 1}`}
                  className="w-16 h-16 md:w-[90px] md:h-[90px] object-cover rounded-xl border border-border/50 shadow-sm"
                />
                <button
                  onClick={() => onRemoveImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-muted/40 rounded-[1.5rem] border border-border/50 focus-within:border-primary/50 transition-all duration-300 px-3 md:px-4 py-2.5 md:py-3 shadow-sm">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask anything..."
            disabled={disabled || isGenerating}
            className="min-h-[40px] md:min-h-[44px] max-h-[160px] md:max-h-[200px] resize-none border-0 bg-transparent p-0 text-[15px] md:text-base focus-visible:ring-0 shadow-none leading-relaxed"
            rows={1}
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/5">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full border-border/40 hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isGenerating}
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full border-border/40 hover:bg-muted/50"
                    title="Insert emoji"
                  >
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl" side="top" align="start">
                  <div className="grid grid-cols-5 gap-1">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessage(prev => prev + emoji);
                          textareaRef.current?.focus();
                        }}
                        className="h-10 w-10 flex items-center justify-center text-xl hover:bg-muted rounded-xl transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center bg-muted/60 rounded-full p-0.5 border border-border/40 shadow-inner">
                <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center p-1 md:p-1.5 bg-background rounded-full shadow-sm ml-0.5">
                  <img src={zenoLogo} alt="Zeno" className="w-full h-full object-contain" />
                </div>
                <div className="w-[1px] h-3 bg-border/40 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 md:h-7 px-2 md:px-3 rounded-full text-[10px] md:text-xs font-bold transition-all ${thinkingEnabled ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setThinkingEnabled(!thinkingEnabled)}
                >
                  <Brain className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 md:mr-1.5" />
                  <span className="hidden xs:inline">Thinking</span>
                </Button>
                <div className="w-[1px] h-3 bg-border/40 mx-0.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 md:h-7 px-2 md:px-3 rounded-full text-[10px] md:text-xs font-bold transition-all ${searchEnabled ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setSearchEnabled(!searchEnabled)}
                >
                  <Search className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 md:mr-1.5" />
                  <span className="hidden xs:inline">Search</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 md:h-9 md:w-9 rounded-full transition-all duration-300 ${isRecording ? "bg-primary text-primary-foreground animate-pulse shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                onClick={onToggleRecording}
                disabled={isGenerating}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <AudioLines className="w-4 md:w-5 h-4 md:h-5" />
              </Button>
              
              <Button
                size="icon"
                disabled={isGenerating || (!message.trim() && attachedImages.length === 0)}
                onClick={handleSubmit}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isGenerating ? <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" /> : <Send className="w-4 md:w-5 h-4 md:h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {featureTags.slice(0, 3).map((tag) => (
            <Button
              key={tag.label}
              variant="outline"
              size="sm"
              className="h-6 rounded-full bg-background border-border/40 hover:bg-muted text-[10px] md:text-xs gap-1.5 px-3 font-bold text-muted-foreground hover:text-foreground transition-all"
              onClick={() => handleTagClick(tag.model)}
            >
              <tag.icon className="w-2.5 h-2.5" />
              {tag.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
