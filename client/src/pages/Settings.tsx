import { useState } from "react";
import { ArrowLeft, Trash2, Edit2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useChatStore } from "@/lib/store";
import { saveUserProfile } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import avatar1 from "@assets/image_1767059069765.png";
import avatar2 from "@assets/image_1767059090978.png";
import avatar3 from "@assets/image_1767059124279.png";
import avatar4 from "@assets/image_1767059177424.png";
import avatar5 from "@assets/image_1767059193731.png";
import avatar6 from "@assets/image_1767059240340.png";

const AVATAR_OPTIONS = [
  { id: "avatar-1", label: "Avatar 1", image: avatar1 },
  { id: "avatar-2", label: "Avatar 2", image: avatar2 },
  { id: "avatar-3", label: "Avatar 3", image: avatar3 },
  { id: "avatar-4", label: "Avatar 4", image: avatar4 },
  { id: "avatar-5", label: "Avatar 5", image: avatar5 },
  { id: "avatar-6", label: "Avatar 6", image: avatar6 },
];

const PERSONALITY_OPTIONS = [
  { id: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { id: "professional", label: "Professional", desc: "Focused and direct" },
  { id: "creative", label: "Creative", desc: "Imaginative and playful" },
  { id: "analytical", label: "Analytical", desc: "Detailed and logical" },
  { id: "casual", label: "Casual", desc: "Relaxed and conversational" },
];

const GENDER_OPTIONS = [
  { id: "not-specified", label: "Prefer not to say" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "non-binary", label: "Non-binary" },
  { id: "other", label: "Other" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    user,
    userName,
    userAvatar,
    userPersonality,
    userGender,
    setUserName,
    setUserAvatar,
    setUserPersonality,
    setUserGender,
    memories,
    addMemory,
    deleteMemory,
    updateMemory,
  } = useChatStore();

  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);
  const [personality, setPersonality] = useState(userPersonality);
  const [gender, setGender] = useState(userGender);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newMemory, setNewMemory] = useState("");
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingMemoryContent, setEditingMemoryContent] = useState("");

  const handleAddMemory = () => {
    if (newMemory.trim()) {
      addMemory(newMemory.trim());
      setNewMemory("");
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditingMemoryId(id);
    setEditingMemoryContent(content);
  };

  const saveEditedMemory = () => {
    if (editingMemoryId && editingMemoryContent.trim()) {
      updateMemory(editingMemoryId, editingMemoryContent.trim());
      setEditingMemoryId(null);
    }
  };

  const handleSave = async () => {
    const cleanName = (name || "").trim().slice(0, 100);
    setUserName(cleanName || "User");
    setUserAvatar(avatar);
    setUserPersonality(personality);
    setUserGender(gender);
    
    // Save to Firestore if user is logged in
    if (user?.uid) {
      setIsSaving(true);
      try {
        await saveUserProfile(user.uid, {
          userName: cleanName || "User",
          userAvatar: avatar,
          userPersonality: personality,
          userGender: gender,
        });
        toast({
          title: "Success",
          description: "Your profile has been saved!",
        });
      } catch (error) {
        console.error("Error saving profile:", error);
        toast({
          title: "Error",
          description: "Failed to save profile. Changes saved locally.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
    
    setLocation("/");
  };

  // Auto-clean corrupted name on load
  const displayName = name && name.includes("timeout") ? "" : name;

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
          <h2 className="text-base font-semibold mb-6">Your Profile</h2>
          <div className="space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                value={displayName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-base"
                data-testid="input-settings-name"
              />
            </div>

            {/* Avatar Selection */}
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

            {/* Personality Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Personality Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERSONALITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPersonality(option.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      personality === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover-elevate"
                    }`}
                    data-testid={`button-personality-${option.id}`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => setGender(option.id)}
                    variant={gender === option.id ? "default" : "outline"}
                    className="rounded-full"
                    data-testid={`button-gender-${option.id}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold mb-6">AI Memory</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Things Zeno remembers about you. These are used to personalize your conversations.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Add something for Zeno to remember..."
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
              />
              <Button onClick={handleAddMemory} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {memories.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
                  No memories yet. Tell Zeno "Remember that..." or add one here.
                </div>
              ) : (
                memories.map((memory) => (
                  <div key={memory.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border group">
                    {editingMemoryId === memory.id ? (
                      <>
                        <Input 
                          value={editingMemoryContent}
                          onChange={(e) => setEditingMemoryContent(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="icon" variant="ghost" onClick={saveEditedMemory}>
                          <Save className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 text-sm">{memory.content}</div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8" 
                            onClick={() => startEditing(memory.id, memory.content)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteMemory(memory.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
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
