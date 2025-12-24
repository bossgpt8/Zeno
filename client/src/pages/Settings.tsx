import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useChatStore } from "@/lib/store";
import { useLocation } from "wouter";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const { userName, setUserName, userGender, setUserGender } = useChatStore();
  const [name, setName] = useState(userName);
  const [gender, setGender] = useState(userGender);

  const handleSaveName = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  const handleSaveGender = (value: string) => {
    setGender(value);
    setUserGender(value);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-md">
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-semibold mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name</label>
                  <div className="flex gap-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                      data-testid="input-settings-name"
                    />
                    <Button
                      onClick={handleSaveName}
                      disabled={name === userName || !name.trim()}
                      data-testid="button-save-name"
                    >
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    BossAI will use this name to personalize your conversations.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender/Sex</label>
                  <Select value={gender} onValueChange={handleSaveGender}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-specified">Prefer not to say</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This helps BossAI give you more personalized and friendly responses.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold mb-3">About BossAI</h2>
              <p className="text-sm text-muted-foreground">
                BossAI is your intelligent, friendly AI assistant designed to be helpful, warm, and genuinely supportive. Whether you need help with work, learning, creative projects, or just having a thoughtful conversation, BossAI is here for you!
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
