import { Mic, X, MoreHorizontal, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";

interface VoiceRecordingOverlayProps {
  isRecording: boolean;
  onStop: () => void;
}

export function VoiceRecordingOverlay({ isRecording, onStop }: VoiceRecordingOverlayProps) {
  const { currentModel } = useChatStore();
  
  if (!isRecording) return null;

  // Extract model name for display
  const modelName = currentModel.split("/").pop()?.split(":").shift() || currentModel;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]"
      data-testid="voice-recording-overlay"
    >
      {/* Top Timer/Status */}
      <div className="absolute top-12 px-4 py-1.5 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground">
        00:03 / 10:00
      </div>

      {/* Main Animated Circle */}
      <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-400 to-pink-400 opacity-60 blur-3xl animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Subtle wave animation inside */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm animate-[pulse_3s_infinite]" />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-16 w-full max-w-sm px-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onStop}
          className="w-12 h-12 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
          data-testid="button-stop-recording"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
          </div>
          <span className="text-sm font-medium text-foreground">I'm listening</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
            {modelName}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-muted/50 text-foreground hover:bg-muted"
        >
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Mic indicator at bottom right (optional placeholder matching image) */}
      <div className="absolute bottom-16 right-8 md:right-16 lg:right-32 xl:right-64">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-foreground">
          <Mic className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
