import { HelpCircle, BookOpen, MessageSquare, Image as ImageIcon, Sparkles, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function QuickGuide() {
  const guides = [
    {
      icon: MessageSquare,
      title: "Smart Chatting",
      description: "Ask anything! Use Shift+Enter for new lines on desktop, or just Enter for new lines on mobile (Shift+Enter to send on mobile)."
    },
    {
      icon: ImageIcon,
      title: "Image Vision",
      description: "Attach images using the + button or paste them directly from your clipboard to analyze them with AI."
    },
    {
      icon: Sparkles,
      title: "Image Generation",
      description: "Switch to 'Image Generation' model using the selector at the top to create artwork from descriptions."
    },
    {
      icon: BookOpen,
      title: "Deep Research",
      description: "Need a deep dive? Use the 'Deep Research' tag to switch to models optimized for detailed analysis."
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Personalize your experience in the sidebar: set your name, choose an avatar, and adjust theme colors."
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 rounded-full">
          <HelpCircle className="w-4 h-4" />
          Quick Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Quick Start Guide</DialogTitle>
          <DialogDescription>
            Learn how to get the most out of Zeno.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 py-4">
            {guides.map((guide, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <guide.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">{guide.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
