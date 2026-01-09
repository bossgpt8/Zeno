import { Sparkles, Search } from "lucide-react";

interface TypingIndicatorProps {
  thinkingEnabled?: boolean;
  searchEnabled?: boolean;
}

export function TypingIndicator({ thinkingEnabled, searchEnabled }: TypingIndicatorProps) {
  let statusText = "Thinking...";
  let Icon = Sparkles;

  if (searchEnabled) {
    statusText = "Searching the web...";
    Icon = Search;
  }

  return (
    <div className="mb-4 animate-in fade-in duration-300 flex justify-start">
      <div className="rounded-2xl px-4 py-2 bg-muted flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-primary animate-pulse" />}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground animate-pulse">
            {statusText}
          </span>
          <div className="flex gap-1.5 mt-1" data-testid="typing-indicator">
            <span 
              className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
            />
            <span 
              className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
            />
            <span 
              className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
              style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
