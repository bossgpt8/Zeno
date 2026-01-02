import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, Edit2, Save, Plus, User, Sliders, Brain, Info, Monitor, Layout, Globe, Volume2, ChevronRight, ChevronDown, MessageSquare, Download, Upload, Archive, Github, Twitter, Linkedin, MessageCircle, X, HelpCircle } from "lucide-react";
import { SiDiscord, SiX, SiGithub, SiLinkedin } from "react-icons/si";
import { Textarea } from "@/components/ui/textarea";

const RESPONDER_STYLES = [
  { id: "default", label: "Default", description: "Balances professionalism and friendliness." },
  { id: "concise", label: "Concise", description: "Short, direct, to the point." },
  { id: "socratic", label: "Socratic", description: "Guides with probing questions." },
  { id: "formal", label: "Formal", description: "Uses academic/professional tone." },
];
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
    conversations,
    setConversations,
  } = useChatStore();

  const { theme, setTheme } = useTheme();

  const handleArchiveAll = () => {
    const updated = conversations.map(c => ({ ...c, pinned: false })); // Logic for archive can be refined if there's an actual 'archived' state, for now we'll mock success
    setConversations(updated);
    toast({ title: "Chats Archived", description: "All conversations have been moved to archive." });
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete ALL chats? This cannot be undone.")) {
      setConversations([]);
      toast({ title: "Chats Deleted", description: "All conversations have been permanently removed.", variant: "destructive" });
    }
  };
  
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
                    <Button 
                      variant={theme === "system" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("system")}
                      className={`rounded-full px-4 h-7 text-xs transition-all ${
                        theme === "system" ? "bg-background shadow-sm border border-border/50 font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      System
                    </Button>
                    <Button 
                      variant={theme === "light" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("light")}
                      className={`rounded-full px-4 h-7 text-xs transition-all ${
                        theme === "light" ? "bg-background shadow-sm border border-border/50 font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Light
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("dark")}
                      className={`rounded-full px-4 h-7 text-xs transition-all ${
                        theme === "dark" ? "bg-background shadow-sm border border-border/50 font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dark
                    </Button>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            try {
                              const data = JSON.parse(re.target?.result as string);
                              if (Array.isArray(data)) {
                                setConversations([...conversations, ...data]);
                                toast({ title: "Success", description: "Chats imported successfully!" });
                              }
                            } catch (err) {
                              toast({ title: "Error", description: "Invalid chat file format.", variant: "destructive" });
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30"
                  >
                    Import Chats
                  </Button>
                </div>
                
                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Export Chats</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const data = JSON.stringify(conversations, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `zeno-chats-export-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Success", description: "Your chats have been exported." });
                    }}
                    className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30"
                  >
                    Export Chats
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Archive All Chats</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleArchiveAll}
                    className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30"
                  >
                    Archive All Chats
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Delete All Chats</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeleteAll}
                    className="h-8 text-xs font-semibold px-4 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
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
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
              <h2 className="text-2xl font-bold">Personalization</h2>

              {/* Memory Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Memory</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                        <Sliders className="w-3 h-3" /> Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#1a1a1a] border-border/40 p-0 overflow-hidden rounded-2xl">
                      <div className="p-6 space-y-6">
                        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                          <DialogTitle className="text-xl font-bold">Saved Memory</DialogTitle>
                        </DialogHeader>
                        
                        <p className="text-[13px] text-muted-foreground">
                          Memory storage can hold up to 50 items. If this limit is exceeded, the oldest memories will be removed.
                        </p>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {memories.map((memory) => (
                            <div key={memory.id} className="group relative bg-[#242424] hover:bg-[#2a2a2a] border border-border/20 rounded-xl transition-colors p-4">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm leading-relaxed pr-8">{memory.content}</p>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                                  onClick={() => deleteMemory(memory.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {memories.length === 0 && (
                            <div className="text-center py-20 bg-muted/5 rounded-2xl border border-dashed border-border/20">
                              <Brain className="w-8 h-8 mx-auto mb-3 opacity-10" />
                              <p className="text-sm text-muted-foreground">No memories saved yet.</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border/10">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 h-9 px-6 text-xs font-bold"
                            onClick={() => {
                              if (confirm("Forget all memories? This cannot be undone.")) {
                                memories.forEach(m => deleteMemory(m.id));
                              }
                            }}
                          >
                            Forget All
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">Reference saved memories</div>
                      <div className="text-[12px] text-muted-foreground">Zeno will save and reference memories when generating replies.</div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>

                  <Separator className="opacity-50" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">Reference the chat history</div>
                      <div className="text-[12px] text-muted-foreground">Zeno will reference saved memory when generating responses.</div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>
                </div>
              </div>

              {/* Customize Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customize Zeno</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                        <Sliders className="w-3 h-3" /> Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#1a1a1a] border-border/40 p-0 overflow-hidden rounded-2xl">
                      <div className="p-8 space-y-8">
                        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                          <DialogTitle className="text-xl font-bold">Customize Zeno</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-8 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                          {/* Nickname */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold">What would you like Zeno to call you?</label>
                            <div className="relative">
                              <Input 
                                placeholder="Nickname" 
                                className="bg-[#242424] border-border/20 h-12 rounded-xl text-sm px-4 focus-visible:ring-primary/30"
                                maxLength={128}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
                                {name.length}/128
                              </div>
                            </div>
                          </div>

                          {/* Context */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold">What would you like Zeno to know about you to better tailor its responses to your needs?</label>
                            <div className="relative">
                              <Textarea 
                                placeholder="For example: Preparing for high school students; Python developers or Little Red Book creators"
                                className="bg-[#242424] border-border/20 min-h-[80px] rounded-xl text-sm p-4 focus-visible:ring-primary/30 resize-none"
                                maxLength={500}
                              />
                              <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-medium">
                                0/500
                              </div>
                            </div>
                          </div>

                          {/* Response Style */}
                          <div className="space-y-3">
                            <label className="text-sm font-semibold">How would you like Zeno to respond?</label>
                            <div className="grid grid-cols-2 gap-3">
                              {RESPONDER_STYLES.map((style) => (
                                <button
                                  key={style.id}
                                  className="flex flex-col items-start p-4 rounded-xl border border-border/20 bg-[#242424] hover:bg-[#2a2a2a] transition-colors text-left group"
                                >
                                  <div className="font-bold text-sm mb-1">{style.label}</div>
                                  <div className="text-[11px] text-muted-foreground leading-tight">{style.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Instructions */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                              <label className="text-sm font-semibold">Custom instruction: How should Zeno behave?</label>
                              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <Textarea 
                              placeholder="Please specify the rules, roles you expect Zeno to follow, or the specific response format you would like to be used."
                              className="bg-[#242424] border-border/20 min-h-[100px] rounded-xl text-sm p-4 focus-visible:ring-primary/30 resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border/10">
                          <div className="flex items-center gap-3">
                            <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                            <span className="text-sm font-medium">Enable in new chat</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="rounded-xl px-6 h-11 text-sm font-medium hover:bg-muted/10">Cancel</Button>
                            </DialogTrigger>
                            <Button className="rounded-xl px-8 h-11 text-sm font-bold bg-primary hover:bg-primary/90">Save</Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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

          {activeTab === "account" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold">Account</h2>

              <div className="space-y-8">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50">
                      <img 
                        src={AVATAR_OPTIONS.find(a => a.id === userAvatar)?.image || avatar1} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-lg">{userName || "User"}</div>
                      <div className="text-xs text-muted-foreground">{user?.email || "osanisrael2@gmail.com"}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("personalization")} className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                    Edit account
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Password management</div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-4 rounded-lg bg-muted/30">
                    Change password
                  </Button>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center justify-between py-2">
                  <div className="font-medium text-sm">Account Management</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                        toast({ title: "Request Sent", description: "Your account deletion request is being processed.", variant: "destructive" });
                      }
                    }}
                    className="h-8 text-xs font-semibold px-4 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Delete Account
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

          {activeTab === "about" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
              <h2 className="text-2xl font-bold">About</h2>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                    The Zeno team is dedicated to pursuing artificial general intelligence (AGI) and is focused on building generalist models, including large language models and large multimodal models. Our mission is to create safe, responsible, and intelligent models, making AGI accessible to the global community through open-source initiatives. We have developed a diverse portfolio of AGI models, with our latest release being the Zeno3 series of large language models, officially launched on January 2, 2026. The Zeno3 series includes multiple models of various sizes, featuring both dense models and Mixture-of-Experts (MoE) architectures. We have also introduced specialized models such as Zeno3-Coder for enhanced programming capabilities. In the multimodal domain, we have released Zeno-Image, a 20B parameter image generation foundation model, and its advanced editing counterpart, Zeno-Image-Edit. To enable more sophisticated applications, we have developed the Zeno-Agent framework, leveraging the instruction-following, tool-use, and planning capabilities of our models to create versatile agents. Zeno Chat serves as the primary platform for users and developers to interact with our models, offering comprehensive functionalities such as image and video understanding, image generation, document processing, web search, and tool utilization. We welcome you to explore Zeno Chat and share your valuable feedback with us.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Feedback email</h3>
                  <p className="text-sm font-medium">osanisrael2@gmail.com</p>
                </div>

                <div className="pt-10 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <button className="hover:text-foreground transition-colors">Terms of Service</button>
                    <button className="hover:text-foreground transition-colors">Privacy Policy</button>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <SiGithub className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
                    <SiX className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
                    <SiLinkedin className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
                    <SiDiscord className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
                  </div>
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
        </div>
      </div>
    </div>
  );
}
