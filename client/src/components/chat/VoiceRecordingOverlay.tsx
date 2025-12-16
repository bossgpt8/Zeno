import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecordingOverlayProps {
  isRecording: boolean;
  onStop: () => void;
}

export function VoiceRecordingOverlay({ isRecording, onStop }: VoiceRecordingOverlayProps) {
  if (!isRecording) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      data-testid="voice-recording-overlay"
    >
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/50" style={{ animationDelay: '0.2s' }} />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-destructive">
            <Mic className="w-10 h-10 text-destructive-foreground animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-listening-status">
            Listening...
          </h3>
          <p className="text-sm text-muted-foreground">
            Speak now. Your message will be sent automatically.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="inline-block w-2 h-2 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="inline-block w-2 h-2 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        
        <Button
          variant="outline"
          onClick={onStop}
          className="gap-2"
          data-testid="button-stop-recording"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
