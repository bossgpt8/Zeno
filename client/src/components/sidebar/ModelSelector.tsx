import { useState } from "react";
import { ChevronDown, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AI_MODELS } from "@shared/schema";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m: any) => m.id === modelId);
      if (model) return model.name;
    }
    return "Select Model";
  };

  const handleSelectModel = (modelId: string) => {
    onChange(modelId);
    setOpen(false);
    setShowAll(false);
  };

  const categories = [
    { key: "vision", label: "Vision Capable", models: AI_MODELS.vision },
    { key: "text", label: "Text Only", models: AI_MODELS.text },
    { key: "image", label: "Image Generation", models: AI_MODELS.image },
    { key: "code", label: "Code Generation", models: AI_MODELS.code },
  ];

  return (
    <Popover open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) setShowAll(false);
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-2 h-8 font-semibold text-foreground hover:bg-muted/50 rounded-lg no-default-hover-elevate"
          data-testid="button-model-selector"
        >
          <span className="truncate max-w-[150px]">{getModelName(value)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden border-border/50 shadow-xl" align="start">
        <div className="p-2 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2 px-2 py-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {showAll ? "All Models" : "Top Models"}
            </span>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {!showAll ? (
              <>
                <div className="space-y-1">
                  {AI_MODELS.best.map((model) => (
                    <Button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      variant={value === model.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto py-3 px-3 text-left flex flex-col items-start gap-1 rounded-lg transition-colors"
                      data-testid={`button-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm">{model.name}</span>
                        {value === model.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {model.description}
                      </span>
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-between mt-2 py-3 px-3 h-auto text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors group"
                  onClick={() => setShowAll(true)}
                >
                  <span>Explore more models</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-xs text-primary h-7 px-2"
                  onClick={() => setShowAll(false)}
                >
                  ← Back to top models
                </Button>
                {categories.map((category) => (
                  <div key={category.key} className="space-y-1">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1">
                      {category.label}
                    </h3>
                    <div className="space-y-0.5">
                      {category.models.map((model) => (
                        <Button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          variant={value === model.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto py-2 px-3 text-left flex flex-col items-start gap-0.5 rounded-md transition-colors"
                        >
                          <span className="font-medium text-sm">{model.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {model.description}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
