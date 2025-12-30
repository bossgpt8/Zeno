import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m) => m.id === modelId);
      if (model) return model.name;
    }
    return "Llama 3.3 70B";
  };

  const handleSelectModel = (modelId: string) => {
    onChange(modelId);
    setOpen(false);
  };

  const categories = [
    { key: "general", label: "Multimodal (Audio, Image, Video, Text)", models: AI_MODELS.general },
    { key: "text", label: "Text Only", models: AI_MODELS.text },
    { key: "image", label: "Image Generation", models: AI_MODELS.image },
    { key: "code", label: "Code Generation", models: AI_MODELS.code },
  ].filter(cat => cat.models && cat.models.length > 0);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        AI Model
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-sm h-9"
            data-testid="button-model-selector"
          >
            <span className="truncate">{getModelName(value)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <ScrollArea className="h-96">
            <div className="p-3">
              {categories.map((category) => (
                <div key={category.key} className="mb-4 last:mb-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 mb-2">
                    {category.label}
                  </h3>
                  <div className="space-y-1">
                    {category.models.map((model) => (
                      <Button
                        key={model.id}
                        onClick={() => handleSelectModel(model.id)}
                        variant={value === model.id ? "default" : "ghost"}
                        className="w-full justify-start h-auto py-2 px-3 text-left flex flex-col items-start"
                        data-testid={`button-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="font-medium text-sm">{model.name}</span>
                        {model.description && (
                          <span className="text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
