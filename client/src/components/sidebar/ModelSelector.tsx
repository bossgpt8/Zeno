import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_MODELS } from "@shared/schema";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m) => m.id === modelId);
      if (model) return model.name;
    }
    return "Nova";
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        AI Model
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className="w-full bg-card border-card-border"
          data-testid="select-model"
        >
          <SelectValue placeholder="Select model">
            {getModelName(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Vision Capable (Understand Images)</SelectLabel>
            {AI_MODELS.vision.map((model) => (
              <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.name.toLowerCase()}`}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Text Only (General Tasks)</SelectLabel>
            {AI_MODELS.text.map((model) => (
              <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.name.toLowerCase()}`}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Image Generation</SelectLabel>
            {AI_MODELS.image.map((model) => (
              <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.name.toLowerCase()}`}>
                {model.name} ({model.description})
              </SelectItem>
            ))}
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Code Generation</SelectLabel>
            {AI_MODELS.code.map((model) => (
              <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.name.toLowerCase()}`}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
