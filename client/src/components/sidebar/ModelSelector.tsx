import { useState, useMemo } from "react";
import { ChevronDown, Search, Zap, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AI_MODELS } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FEATURED_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "black-forest-labs/FLUX.1-schnell",
  "mistralai/devstral-2-mamba:free",
];

const CATEGORIES = [
  { key: "text", label: "Chat & Text", icon: Sparkles, models: AI_MODELS.text },
  { key: "vision", label: "Vision & Images", icon: Zap, models: AI_MODELS.vision },
  { key: "image", label: "Image Generation", icon: Sparkles, models: AI_MODELS.image },
  { key: "code", label: "Code Generation", icon: Code2, models: AI_MODELS.code },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m) => m.id === modelId);
      if (model) return model.name;
    }
    return "Select Model";
  };

  const currentModelName = getModelName(value);

  // Get featured models
  const featuredModels = useMemo(() => {
    return FEATURED_MODELS
      .map((id) => {
        for (const category of Object.values(AI_MODELS)) {
          const model = category.find((m) => m.id === id);
          if (model) return model;
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, []);

  // Filter models based on search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;

    const searchLower = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      models: cat.models.filter(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower)
      ),
    })).filter((cat) => cat.models.length > 0);
  }, [search]);

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        AI Model
      </label>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            data-testid="button-model-selector"
          >
            <span className="truncate">{currentModelName}</span>
            <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Choose AI Model</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            data-testid="input-model-search"
          />

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Featured Section */}
              {!search && featuredModels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Recommended
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {featuredModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          onChange(model.id);
                          setOpen(false);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-accent ${
                          value === model.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover-elevate"
                        }`}
                        data-testid={`button-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="font-medium text-sm text-foreground">{model.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {filteredCategories.map((category) => (
                <div key={category.key}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          onChange(model.id);
                          setOpen(false);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-accent ${
                          value === model.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover-elevate"
                        }`}
                        data-testid={`button-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="font-medium text-sm text-foreground">{model.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
