import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

interface Step {
  target: string;
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right";
}

const steps: Step[] = [
  {
    target: '[data-testid="button-new-chat"]',
    title: "Start Fresh",
    description: "Click here to clear the current conversation and start a new one.",
    position: "right",
  },
  {
    target: '[data-testid="button-toggle-sidebar"]',
    title: "Toggle Sidebar",
    description: "Show or hide your chat history to focus on your current task.",
    position: "bottom",
  },
  {
    target: '[data-testid="button-settings"]',
    title: "Custom Instructions",
    description: "Personalize how Zeno responds to you by providing custom system instructions.",
    position: "top",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updateCoords = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // Fallback for missing elements
        setCoords({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          width: 0,
          height: 0,
        });
      }
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onComplete} />
      
      {/* Highlight Box */}
      <motion.div
        layoutId="highlight"
        className="absolute z-[101] border-2 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
        animate={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute z-[102] w-[280px] bg-card border border-card-border rounded-2xl p-5 shadow-2xl pointer-events-auto"
          style={{
            top: step.position === "bottom" ? coords.top + coords.height + 16 : 
                 step.position === "top" ? Math.max(16, coords.top - 200) :
                 Math.max(16, coords.top),
            left: step.position === "right" ? Math.min(window.innerWidth - 300, coords.left + coords.width + 16) :
                  step.position === "left" ? Math.max(16, coords.left - 300) :
                  Math.max(16, Math.min(window.innerWidth - 300, coords.left)),
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Tutorial {currentStep + 1}/{steps.length}</span>
            </div>
            <button onClick={onComplete} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold mb-1 text-foreground">{step.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full transition-all ${i === currentStep ? "w-3 bg-primary" : "bg-muted"}`} 
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 px-2 text-xs">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="h-8 px-3 text-xs">
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
