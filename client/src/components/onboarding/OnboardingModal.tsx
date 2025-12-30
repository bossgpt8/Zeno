import { useState } from "react";
import { X, MessageSquare, Image, Mic, Sparkles, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OnboardingStep {
  icon: typeof MessageSquare;
  title: string;
  description: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: MessageSquare,
    title: "Chat with AI",
    description: "Ask any question and get intelligent responses. BossAI can help with coding, writing, math, research, and much more.",
    color: "text-blue-500",
  },
  {
    icon: Image,
    title: "Analyze & Generate Images",
    description: "Attach images for analysis or switch to an image model to generate stunning artwork from your descriptions.",
    color: "text-purple-500",
  },
  {
    icon: Mic,
    title: "Voice Conversations",
    description: "Click the microphone to speak your messages. BossAI can also read responses aloud when voice mode is enabled.",
    color: "text-green-500",
  },
  {
    icon: Settings,
    title: "Customize Your Experience",
    description: "Set your name, choose an avatar, personalize your personality style, and configure gender preferences to make BossAI truly yours.",
    color: "text-pink-500",
  },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="onboarding-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center md:text-left">Let's get started!</DialogTitle>
          <DialogDescription className="sr-only">
            A quick tour of what we can do together
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 px-2">
          <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6 ${step.color}`}>
            <IconComponent className="w-10 h-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-center mb-3" data-testid="text-onboarding-title">
            {step.title}
          </h3>
          
          <p className="text-center text-muted-foreground text-sm leading-relaxed max-w-xs" data-testid="text-onboarding-description">
            {step.description}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {ONBOARDING_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              data-testid={`button-onboarding-dot-${index}`}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
            data-testid="button-onboarding-prev"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
            data-testid="button-onboarding-skip"
          >
            Skip
          </Button>
          
          <Button
            onClick={handleNext}
            className="gap-1"
            data-testid="button-onboarding-next"
          >
            {isLastStep ? "Get Started" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
