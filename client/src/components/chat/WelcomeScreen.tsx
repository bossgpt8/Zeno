import { Zap, Layers, Camera, Mic, ImageIcon, Code, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WelcomeScreenProps {
  onSuggestionClick: (prompt: string) => void;
}

const features = [
  { icon: Layers, label: "Multiple AI Models" },
  { icon: Camera, label: "Vision Analysis" },
  { icon: Mic, label: "Voice Chat" },
  { icon: ImageIcon, label: "Image Generation" },
];

const suggestions = [
  {
    icon: BookOpen,
    title: "Master Biology",
    description: "Human body systems explained",
    prompt: "Explain the human digestive system step by step, from eating to nutrient absorption",
  },
  {
    icon: Code,
    title: "Learn to Code",
    description: "Programming tutorials",
    prompt: "Teach me the basics of JavaScript with practical examples",
  },
  {
    icon: Sparkles,
    title: "Creative Writing",
    description: "Stories and content",
    prompt: "Write a short story about an AI that develops emotions",
  },
  {
    icon: Zap,
    title: "Quick Math",
    description: "Solve problems fast",
    prompt: "Help me understand calculus derivatives with simple examples",
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-6 md:p-8">
      <div className="text-center max-w-2xl w-full">
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8">
          <div 
            className="w-full h-full bg-primary rounded-full flex items-center justify-center"
            style={{ boxShadow: "0 0 60px rgba(255,255,255,0.2)" }}
          >
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
          </div>
        </div>
        
        <h2 
          className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
          data-testid="text-welcome-title"
        >
          Welcome to BossAI
        </h2>
        
        <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 px-4">
          Your intelligent assistant powered by multiple AI models. Ask questions, analyze images, generate images, and chat with voice!
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10 px-4">
          {features.map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-card border border-card-border rounded-full text-xs md:text-sm text-muted-foreground"
            >
              <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {feature.label}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-xl mx-auto px-4">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.title}
              className="group p-4 md:p-5 text-left flex items-start gap-3 md:gap-4 cursor-pointer hover-elevate active-elevate-2 transition-all duration-200"
              onClick={() => onSuggestionClick(suggestion.prompt)}
              data-testid={`card-suggestion-${suggestion.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <suggestion.icon className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-foreground text-sm md:text-base">
                  {suggestion.title}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {suggestion.description}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
