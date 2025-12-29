import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { useChatStore } from "@/lib/store";
import avatar1 from "@assets/stock_images/astronaut_avatar_nas_d6106021.jpg";
import avatar2 from "@assets/stock_images/astronaut_avatar_nas_bc39255e.jpg";
import avatar3 from "@assets/stock_images/astronaut_avatar_nas_d931e821.jpg";

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

export default function Settings() {
  const [, setLocation] = useLocation();
  const {
    userName,
    userAvatar,
    userPersonality,
    userGender,
    setUserName,
    setUserAvatar,
    setUserPersonality,
    setUserGender,
  } = useChatStore();

  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);
  const [personality, setPersonality] = useState(userPersonality);
  const [gender, setGender] = useState(userGender);

  const handleSave = () => {
    setUserName(name.trim() || userName);
    setUserAvatar(avatar);
    setUserPersonality(personality);
    setUserGender(gender);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back-chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold mb-4">Your Profile</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-base"
                data-testid="input-settings-name"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Your Avatar</label>
              <div className="grid grid-cols-3 gap-4">
                {AVATAR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAvatar(option.id)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden transition-all border-2 ${
                      avatar === option.id 
                        ? "border-primary scale-105" 
                        : "border-border"
                    }`}
                    title={option.label}
                    data-testid={`button-settings-avatar-${option.id}`}
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
                <SelectTrigger className="text-base" data-testid="select-settings-personality">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="text-base" data-testid="select-settings-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Prefer not to say</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-cancel-settings"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save-settings"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
