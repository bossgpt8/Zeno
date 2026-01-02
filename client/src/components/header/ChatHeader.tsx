import { Menu, Moon, Sun, Palette, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button as BaseButton } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme, ACCENT_COLORS } from "@/components/ThemeProvider";
import zenoLogo from "@assets/image_1767364441563.png";
import { useLocation } from "wouter";
import { ModelSelector } from "@/components/sidebar/ModelSelector";
import { useChatStore } from "@/lib/store";

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
  const { setCurrentModel, sidebarOpen } = useChatStore();
  
  return (
    <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-4">
          <BaseButton
            size="icon"
            variant="ghost"
            onClick={onToggleSidebar}
            data-testid="button-toggle-sidebar"
            className="flex"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </BaseButton>
          
          <div className="flex items-center gap-2">
            <img 
              src={zenoLogo} 
              alt="Zeno" 
              className="h-8 md:h-9 w-auto rounded-lg overflow-hidden border border-border/30"
              data-testid="img-zeno-header"
            />
            <ModelSelector value={currentModel} onChange={setCurrentModel} />
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <BaseButton
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
            title="Settings"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </BaseButton>

          <Popover>
            <PopoverTrigger asChild>
              <BaseButton
                size="icon"
                variant="ghost"
                title="Change accent color"
                data-testid="button-accent-color"
              >
                <Palette className="w-4 h-4 md:w-5 md:h-5" />
              </BaseButton>
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
          
          <BaseButton
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
          </BaseButton>
        </div>
      </div>
    </header>
  );
}
