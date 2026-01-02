import { useState } from "react";
import { ArrowLeft, Trash2, Edit2, Save, Plus, User, Sliders, Brain, Info, Monitor, Layout, Globe, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useChatStore } from "@/lib/store";
import { saveUserProfile } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import avatar1 from "@assets/image_1767059069765.png";
import avatar2 from "@assets/image_1767059090978.png";
import avatar3 from "@assets/image_1767059124279.png";
import avatar4 from "@assets/image_1767059177424.png";
import avatar5 from "@assets/image_1767059193731.png";
import avatar6 from "@assets/image_1767059240340.png";

const TABS = [
  { id: "general", label: "General", icon: Sliders },
  { id: "interface", label: "Interface", icon: Monitor },
  { id: "models", label: "Models", icon: Layout },
  { id: "chats", label: "Chats", icon: Brain },
  { id: "personalization", label: "Personalization", icon: User },
  { id: "account", label: "Account", icon: User },
  { id: "about", label: "About", icon: Info },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personalization");
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

  const handleSave = async () => {
    const cleanName = (name || "").trim().slice(0, 100);
    setUserName(cleanName || "User");
    setUserAvatar(avatar);
    setUserPersonality(personality);
    setUserGender(gender);
    
    if (user?.uid) {
      setIsSaving(true);
      try {
        await saveUserProfile(user.uid, {
          userName: cleanName || "User",
          userAvatar: avatar,
          userPersonality: personality,
          userGender: gender,
        });
        toast({ title: "Success", description: "Your profile has been saved!" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-bold text-lg">Settings</h1>
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">
          {activeTab === "personalization" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">Personalization</h2>

              {/* Theme/General UI Look */}
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <div className="font-medium">Theme</div>
                  </div>
                  <div className="flex bg-muted p-1 rounded-full border border-border">
                    <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">System</Button>
                    <Button variant="ghost" size="sm" className="rounded-full px-4 h-8">Light</Button>
                    <Button variant="secondary" size="sm" className="rounded-full px-4 h-8 bg-background shadow-sm border border-border/50">Dark</Button>
                  </div>
                </div>
                
                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div className="font-medium">Language</div>
                  </div>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[180px] bg-transparent border-0 hover:bg-muted/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <div className="font-medium">Voice</div>
                  </div>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Katerina
                  </Button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-8 pt-4">
                <h3 className="text-lg font-semibold">Profile</h3>
                
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/20 border-border/50 focus:border-primary/50"
                    />
                  </div>

                  <div className="grid gap-4">
                    <label className="text-sm font-medium text-muted-foreground">Avatar</label>
                    <div className="flex flex-wrap gap-4">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setAvatar(opt.id)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            avatar === opt.id ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                        >
                          <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-border">
                <Button variant="ghost" onClick={() => setLocation("/")}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab !== "personalization" && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
              <div className="p-4 bg-muted/30 rounded-full">
                <Layout className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
