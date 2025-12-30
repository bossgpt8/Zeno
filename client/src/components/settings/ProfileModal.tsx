import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import avatar1 from "@assets/stock_images/astronaut_avatar_nas_d6106021.jpg";
import avatar2 from "@assets/stock_images/astronaut_avatar_nas_bc39255e.jpg";
import avatar3 from "@assets/stock_images/astronaut_avatar_nas_d931e821.jpg";

import { getUserProfile, saveUserProfile } from "@/lib/firebase";
import { useChatStore } from "@/lib/store";

const AVATAR_OPTIONS = [
  { id: "avatar-1", label: "Astronaut 1", image: avatar1 },
  { id: "avatar-2", label: "Astronaut 2", image: avatar2 },
  { id: "avatar-3", label: "Astronaut 3", image: avatar3 },
];

const PERSONALITY_OPTIONS = [
  { id: "friendly", label: "Friendly - Warm and approachable" },
  { id: "professional", label: "Professional - Focused and direct" },
  { id: "creative", label: "Creative - Imaginative and playful" },
  { id: "analytical", label: "Analytical - Detailed and logical" },
  { id: "casual", label: "Casual - Relaxed and conversational" },
];

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaveProfile: (name: string, avatar: string, personality: string) => void;
  currentName?: string;
  currentAvatar?: string;
  currentPersonality?: string;
}

export function ProfileModal({
  open,
  onClose,
  onSaveProfile,
  currentName = "User",
  currentAvatar = "avatar-1",
  currentPersonality = "friendly",
}: ProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [personality, setPersonality] = useState(currentPersonality);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveProfile(name.trim(), avatar, personality);
      
      // Sync profile to Firestore if user is signed in
      const user = useChatStore.getState().user;
      if (user?.uid) {
        try {
          await saveUserProfile(user.uid, {
            userName: name.trim(),
            userAvatar: avatar,
            userPersonality: personality,
            userGender: useChatStore.getState().userGender
          });
        } catch (error) {
          console.error("Error syncing profile to Firestore:", error);
        }
      }
      
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make it your own</DialogTitle>
          <DialogDescription>
            Tell me a bit about yourself so I can adjust how I talk and help you better.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Name</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-base"
              data-testid="input-profile-name"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Your Avatar</label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAvatar(option.id)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all border-2 ${
                    avatar === option.id 
                      ? "border-primary scale-105" 
                      : "border-border"
                  }`}
                  title={option.label}
                  data-testid={`button-avatar-${option.id}`}
                >
                  <img 
                    src={option.image} 
                    alt={option.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Personality</label>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="text-base" data-testid="select-personality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              data-testid="button-cancel-profile"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              data-testid="button-save-profile"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
