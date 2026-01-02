import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X, Loader2, Brain, Search, Plus, AudioLines, Image as ImageIcon, Code, BookOpen, GraduationCap, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/lib/store";
import { AI_MODELS } from "@shared/schema";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Puzzle, Plane, Code as CodeIcon, Calendar, Newspaper, Search as SearchIcon, FileText, GraduationCap as GraduationCapIcon, PenTool, Lightbulb } from "lucide-react";

import zenoLogo from "@assets/image_1767364441563.png";

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
  const { thinkingEnabled, setThinkingEnabled, searchEnabled, setSearchEnabled, setCurrentModel } = useChatStore();

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
    <div className="border-t border-border bg-background/80 backdrop-blur-md p-2 md:p-4 pb-4">
      <div className="max-w-3xl mx-auto space-y-2">
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={img}
                  alt={`Attached ${i + 1}`}
                  className="w-20 h-20 md:w-[90px] md:h-[90px] object-cover rounded-lg border-2 border-border"
                />
                <button
                  onClick={() => onRemoveImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-muted/30 rounded-2xl border border-border focus-within:border-primary/50 transition-colors px-4 py-3">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="How can I help you today?"
            disabled={disabled || isGenerating}
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-sm md:text-base focus-visible:ring-0 shadow-none"
            rows={1}
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full border-border/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isGenerating}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              
              <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border/50">
                <div className="w-7 h-7 flex items-center justify-center p-1.5 bg-background rounded-full shadow-sm ml-0.5">
                  <img src={zenoLogo} alt="Zeno" className="w-full h-full object-contain" />
                </div>
                <div className="w-[1px] h-3 bg-border/50 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${thinkingEnabled ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setThinkingEnabled(!thinkingEnabled)}
                >
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  Thinking
                </Button>
                <div className="w-[1px] h-3 bg-border/50 mx-0.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${searchEnabled ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setSearchEnabled(!searchEnabled)}
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className={`h-9 w-9 rounded-full transition-all duration-300 ${isRecording ? "bg-primary text-primary-foreground animate-pulse shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"}`}
                onClick={onToggleRecording}
                disabled={isGenerating}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <AudioLines className="w-5 h-5" />
              </Button>
              
              <Button
                size="icon"
                disabled={isGenerating || (!message.trim() && attachedImages.length === 0)}
                onClick={handleSubmit}
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {featureTags.slice(0, 3).map((tag) => (
            <Button
              key={tag.label}
              variant="outline"
              size="sm"
              className="h-6 rounded-full bg-background border-border/50 hover:bg-muted text-[9px] md:text-xs gap-1 px-2"
              onClick={() => handleTagClick(tag.model)}
            >
              <tag.icon className="w-2.5 h-2.5 text-muted-foreground" />
              {tag.label}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 rounded-full bg-background border-border/50 hover:bg-muted text-[9px] md:text-xs px-2"
              >
                More
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] md:w-[480px] p-2 rounded-2xl border-border bg-background/95 backdrop-blur-md shadow-2xl" side="top" align="center">
              <div className="flex flex-wrap gap-1 justify-center py-1">
                {[...featureTags.slice(3), ...moreTags].map((tag) => (
                  <Button
                    key={tag.label}
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full bg-background border-border/50 hover:bg-muted text-[10px] md:text-xs gap-1 px-2.5"
                    onClick={() => handleTagClick(tag.model)}
                  >
                    <tag.icon className="w-3 h-3 text-muted-foreground" />
                    {tag.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
