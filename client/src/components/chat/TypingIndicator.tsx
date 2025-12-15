export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8 animate-in fade-in duration-300">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-card border border-card-border text-foreground text-sm md:text-base">
        AI
      </div>
      
      <div className="pt-2">
        <div className="flex gap-1.5" data-testid="typing-indicator">
          <span 
            className="w-2.5 h-2.5 bg-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
          />
          <span 
            className="w-2.5 h-2.5 bg-foreground rounded-full animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
          />
          <span 
            className="w-2.5 h-2.5 bg-foreground rounded-full animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
