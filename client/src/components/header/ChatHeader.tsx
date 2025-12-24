import { Menu, Moon, Sun, Palette, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme, ACCENT_COLORS } from "@/components/ThemeProvider";
import { AI_MODELS } from "@shared/schema";
import bossaiRobot from "@assets/bossai-robot.png";
import { useLocation } from "wouter";

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
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();
  const [, setLocation] = useLocation();
  
  const getModelName = (modelId: string): string => {
    for (const category of Object.values(AI_MODELS)) {
      const model = category.find((m) => m.id === modelId);
      if (model) return model.name;
    }
    return "Nova";
  };

  return (
    <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
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
          
          <img 
            src={bossaiRobot} 
            alt="BossAI" 
            className="h-8 md:h-9 w-auto"
            data-testid="img-bossai-header"
          />
          
          <Badge variant="secondary" className="text-xs font-medium" data-testid="badge-current-model">
            {getModelName(currentModel)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
            title="Settings"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                title="Change accent color"
                data-testid="button-accent-color"
              >
                <Palette className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <p className="text-sm font-medium mb-3 text-foreground">Accent Color</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id as any)}
                    aria-label={`Set accent color to ${color.name}`}
                    aria-pressed={accentColor === color.id}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      accentColor === color.id 
                        ? "border-foreground scale-110" 
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                    data-testid={`button-accent-${color.id}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-toggle-theme"
            className="relative overflow-visible"
          >
            <div className="relative">
              {theme === "dark" ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
              )}
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
