import { Menu, Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { AI_MODELS } from "@shared/schema";

interface ChatHeaderProps {
  currentModel: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  currentModel,
  voiceEnabled,
  onToggleVoice,
  onToggleSidebar,
}: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m) => m.id === modelId);
      if (model) return model.name;
    }
    return "Nova";
  };

  return (
    <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={onToggleSidebar}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <h1 className="text-base md:text-lg font-bold text-foreground">BossAI</h1>
          
          <Badge variant="default" className="text-xs" data-testid="badge-current-model">
            {getModelName(currentModel)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            size="icon"
            variant={voiceEnabled ? "default" : "ghost"}
            onClick={onToggleVoice}
            title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
            data-testid="button-toggle-voice"
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
