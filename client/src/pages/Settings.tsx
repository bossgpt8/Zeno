import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, Edit2, Save, Plus, User, Sliders, Brain, Info, Monitor, Layout, Globe, Volume2, ChevronRight, ChevronDown, MessageSquare, Download, Upload, Archive } from "lucide-react";
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

const AVATAR_OPTIONS = [
  { id: "avatar-1", label: "Avatar 1", image: avatar1 },
  { id: "avatar-2", label: "Avatar 2", image: avatar2 },
  { id: "avatar-3", label: "Avatar 3", image: avatar3 },
  { id: "avatar-4", label: "Avatar 4", image: avatar4 },
  { id: "avatar-5", label: "Avatar 5", image: avatar5 },
  { id: "avatar-6", label: "Avatar 6", image: avatar6 },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
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
          {activeTab === "general" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">General</h2>

              {/* Theme/General UI Look */}
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">Theme</div>
                  </div>
                  <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                    <Button variant="ghost" size="sm" className="rounded-full px-4 h-7 text-xs text-muted-foreground hover:text-foreground">System</Button>
                    <Button variant="ghost" size="sm" className="rounded-full px-4 h-7 text-xs text-muted-foreground hover:text-foreground">Light</Button>
                    <Button variant="secondary" size="sm" className="rounded-full px-4 h-7 text-xs bg-background shadow-sm border border-border/50 font-medium">Dark</Button>
                  </div>
                </div>
                
                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">Language</div>
                  </div>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[180px] bg-transparent border-0 hover:bg-muted/30 transition-colors text-sm text-right justify-end gap-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">Voice</div>
                  </div>
                  <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground gap-2 h-auto py-1 px-2">
                    Katerina <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-sm">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="text-sm">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "interface" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">Interface</h2>

              <div className="space-y-6">
                <div className="text-sm font-semibold text-muted-foreground pt-4">Chat</div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Title Auto-Generation</div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                
                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Auto-Copy Response to Clipboard</div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Paste Large Text as File</div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-sm">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="text-sm">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "models" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
              <h2 className="text-2xl font-bold">Models</h2>

              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="qwen3-max" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-all hover:no-underline group data-[state=open]:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-semibold text-sm">Zeno-Max (Qwen3)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 pb-6 space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Zeno-Max is our most advanced reasoning model, excelling in complex mathematics, coding, role-playing, and long-form creative writing.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Maximum context length:</div>
                        <div className="text-lg font-bold">262,144 tokens</div>
                      </div>
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Max generation length:</div>
                        <div className="text-lg font-bold">32,768 tokens</div>
                      </div>
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Intelligence Level:</div>
                        <div className="text-lg font-bold">State-of-the-art</div>
                      </div>
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Modality:</div>
                        <div className="text-lg font-bold">Text + Vision</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="zeno-coder" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-all hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-semibold text-sm">Zeno-Coder</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 pb-6">
                    <p className="text-sm text-muted-foreground">Specialized for high-performance software engineering and technical documentation.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="zeno-vl" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-all hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-semibold text-sm">Zeno-Vision (VL)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 pb-6 space-y-6">
                    <p className="text-sm text-muted-foreground">Our flagship multi-modal model capable of deep visual analysis and image understanding.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Modality:</div>
                        <div className="text-lg font-bold">Text + Vision</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="zeno-lite" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-all hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="font-semibold text-sm">Zeno-Lite</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 pb-6 space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A lightweight, lightning-fast model optimized for quick responses and everyday tasks.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Maximum context length:</div>
                        <div className="text-lg font-bold">128,000 tokens</div>
                      </div>
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Optimized for:</div>
                        <div className="text-lg font-bold">Speed</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="zeno-pro" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-all hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-semibold text-sm">Zeno-Pro</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 pb-6 space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our balanced professional model, perfect for deep analysis and nuanced conversation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Maximum context length:</div>
                        <div className="text-lg font-bold">200,000 tokens</div>
                      </div>
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/50 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Intelligence Level:</div>
                        <div className="text-lg font-bold">Advanced</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-sm">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="text-sm">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">Chats</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Import Chats</div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                    Import Chats
                  </Button>
                </div>
                
                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Export Chats</div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                    Export Chats
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Archive All Chats</div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                    Archive All Chats
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Delete All Chats</div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Delete Chat
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-sm">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="text-sm">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "personalization" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">Personalization</h2>

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
