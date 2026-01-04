import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, Edit2, Save, Plus, User, Sliders, Brain, Info, Monitor, Layout, Globe, Volume2, ChevronRight, ChevronDown, MessageSquare, Download, Upload, Archive, Github, Twitter, Linkedin, MessageCircle, X, HelpCircle } from "lucide-react";
import { SiDiscord, SiX, SiGithub, SiLinkedin } from "react-icons/si";
import { Textarea } from "@/components/ui/textarea";
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

const RESPONDER_STYLES = [
  { id: "default", label: "Default", description: "Balances professionalism and friendliness." },
  { id: "concise", label: "Concise", description: "Short, direct, to the point." },
  { id: "socratic", label: "Socratic", description: "Guides with probing questions." },
  { id: "formal", label: "Formal", description: "Uses academic/professional tone." },
];

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

const SUPPORTED_MODELS = [
  { id: "qwen/qwen-2.5-vl-7b-instruct:free", label: "Qwen 2.5 VL 7B", description: "Vision specialist. Understands images, code, and documents.", tags: ["Vision", "Free"] },
  { id: "qwen/qwen3-coder:free", label: "Qwen Coder 3", description: "Expert at writing and debugging code.", tags: ["Coding", "Free"] },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1", description: "Balanced performance for general reasoning.", tags: ["General", "Free"] },
  { id: "deepseek/deepseek-r1:free", label: "DeepSeek R1", description: "Deep reasoning and brainstorming expert.", tags: ["Reasoning", "Free"] },
  { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell", description: "Ultra-fast high-quality image generation.", tags: ["Images"] },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", label: "Nemotron Nano 12B", description: "Lightweight vision and video understanding.", tags: ["Video", "Free"] },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", description: "State-of-the-art reasoning and knowledge.", tags: ["Powerful", "Free"] },
  { id: "google/gemma-3-27b-it:free", label: "Gemma 3 27B", description: "Google's latest lightweight and fast model.", tags: ["Fast", "Free"] },
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
    const updated = conversations.map(c => ({ ...c, pinned: false }));
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

  const handleAddMemory = () => {
    if (newMemory.trim()) {
      addMemory(newMemory.trim());
      setNewMemory("");
      toast({
        title: "Memory Added",
        description: "Information has been successfully saved to Zeno's memory.",
      });
    }
  };

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
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border/40 bg-muted/5 flex flex-col flex-shrink-0 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="hover-elevate rounded-full bg-background/50 border border-border/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">Settings</h1>
        </div>
        
        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible px-4 pb-4 md:pb-0 space-x-2 md:space-x-0 md:space-y-2 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/10">
        <div className="max-w-3xl mx-auto px-4 md:px-12 py-8 md:py-16 space-y-12 md:space-y-20">
          {activeTab === "general" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">General</h2>
                <p className="text-muted-foreground">Adjust the fundamental look and feel of Zeno.</p>
              </div>

              <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl space-y-8">
                {/* Theme/General UI Look */}
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">App Theme</div>
                      <div className="text-xs text-muted-foreground">Choose your preferred visual mode.</div>
                    </div>
                    <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/20 backdrop-blur-sm self-start sm:self-auto">
                      <Button 
                        variant={theme === "light" ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setTheme("light")}
                        className={`rounded-xl px-6 h-9 text-xs transition-all duration-300 ${
                          theme === "light" ? "bg-background shadow-xl font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Light
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setTheme("dark")}
                        className={`rounded-xl px-6 h-9 text-xs transition-all duration-300 ${
                          theme === "dark" ? "bg-background shadow-xl font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-border/10" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">Display Language</div>
                      <div className="text-xs text-muted-foreground">Set your primary communication language.</div>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-full sm:w-[180px] bg-muted/20 border-border/20 hover:bg-muted/30 transition-all rounded-xl h-10 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/20 backdrop-blur-xl">
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">Assistant Voice</div>
                      <div className="text-xs text-muted-foreground">Select a voice for audio interactions.</div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl border-border/20 hover:bg-muted/30 font-bold h-10 gap-3 group">
                      Katerina <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground font-semibold px-0">Discard changes</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-8 h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {isSaving ? "Syncing..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "interface" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Interface</h2>
                <p className="text-muted-foreground">Tailor your interaction experience with Zeno.</p>
              </div>

              <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl space-y-8">
                <div className="space-y-8">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">Title Auto-Generation</div>
                      <div className="text-xs text-muted-foreground">Automatically name new conversations.</div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary scale-110" />
                  </div>
                  
                  <Separator className="bg-border/10" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">Auto-Copy Response</div>
                      <div className="text-xs text-muted-foreground">Copy AI answers to clipboard instantly.</div>
                    </div>
                    <Switch className="data-[state=checked]:bg-primary scale-110" />
                  </div>

                  <Separator className="bg-border/10" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <div className="font-bold text-base tracking-tight">Large Text Handling</div>
                      <div className="text-xs text-muted-foreground">Paste long snippets as attached files.</div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-primary scale-110" />
                  </div>
                </div>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground font-semibold px-0">Discard changes</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-8 h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {isSaving ? "Syncing..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "models" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Models</h2>
                <p className="text-muted-foreground">Select and configure the AI brains powering Zeno.</p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Available Intelligence</h3>
                  {SUPPORTED_MODELS.map((model) => (
                    <AccordionItem key={model.id} value={model.id} className="border-none">
                      <AccordionTrigger className="flex items-center gap-3 py-4 px-6 rounded-[2rem] hover:bg-primary/5 transition-all hover:no-underline group data-[state=open]:bg-primary/10 border border-transparent data-[state=open]:border-primary/20">
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-3 h-3 rounded-full ${model.id === "qwen/qwen-2.5-vl-7b-instruct:free" ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]" : "bg-muted-foreground/30"}`} />
                          <span className="font-bold text-base tracking-tight">{model.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-8 pb-8 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {model.tags.map(tag => (
                            <div key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                              {tag}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{model.description}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl h-9 px-6 font-bold border-primary/20 hover:bg-primary/10 text-primary"
                          onClick={() => {
                            // Model selection logic can be added to store if needed
                            toast({ title: "Model Selected", description: `${model.label} is now active.` });
                          }}
                        >
                          Select Model
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              </Accordion>

              <div className="flex justify-end gap-3 pt-8 border-t border-border/10">
                <Button variant="ghost" onClick={() => setLocation("/")} className="font-bold">Back to Chat</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-10 h-12 font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105">
                  {isSaving ? "Syncing..." : "Confirm Selection"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Chats</h2>
                <p className="text-muted-foreground">Manage your conversation data and portability.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl space-y-4 group hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative" onClick={() => {
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
                }}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-lg tracking-tight">Import Chats</div>
                    <div className="text-xs text-muted-foreground">Restore conversations from a JSON file.</div>
                  </div>
                </Card>

                <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl space-y-4 group hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative" onClick={() => {
                      const data = JSON.stringify(conversations, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `zeno-chats-export-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Success", description: "Your chats have been exported." });
                }}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-lg tracking-tight">Export Chats</div>
                    <div className="text-xs text-muted-foreground">Download all your chats for safekeeping.</div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-center gap-6 pt-12">
                <Button variant="ghost" className="text-muted-foreground hover:text-destructive transition-colors gap-2" onClick={handleDeleteAll}>
                  <Trash2 className="w-4 h-4" /> Delete all history
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors gap-2" onClick={handleArchiveAll}>
                  <Archive className="w-4 h-4" /> Archive all
                </Button>
              </div>
            </div>
          )}

          {activeTab === "personalization" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Personalization</h2>
                <p className="text-muted-foreground">Tailor Zeno's behavior and remember your preferences.</p>
              </div>

              <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl space-y-10">
                {/* Profile Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold tracking-tight">Your Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold ml-1">Display Name</label>
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What should Zeno call you?"
                        className="rounded-xl bg-muted/20 border-border/20 h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold ml-1">Gender / Identity</label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="rounded-xl bg-muted/20 border-border/20 h-11">
                          <SelectValue placeholder="Select identity" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="not-specified">Not specified</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/10" />

                {/* Response Style Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold tracking-tight">Response Style</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RESPONDER_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setPersonality(style.id)}
                        className={`p-5 rounded-2xl border transition-all text-left space-y-2 group ${
                          personality === style.id
                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                            : "bg-muted/10 border-border/20 hover:border-primary/30"
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          {style.label}
                          {personality === style.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/10" />

                {/* Memory Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold tracking-tight">Memory</h3>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2 font-bold px-4 rounded-xl border-border/20 hover:bg-muted/30">
                          <Sliders className="w-3 h-3" /> Manage ({memories.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-[#1a1a1a] border-border/40 p-0 overflow-hidden rounded-2xl">
                        <div className="p-8 space-y-6">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tighter">Memory Bank</DialogTitle>
                          </DialogHeader>
                          
                          <p className="text-sm text-muted-foreground">
                            Zeno remembers these facts about you to personalize your experience.
                          </p>

                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add something for Zeno to remember..."
                                value={newMemory}
                                onChange={(e) => setNewMemory(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
                                className="rounded-xl border-border/20 bg-muted/20 h-11"
                              />
                              <Button onClick={handleAddMemory} size="icon" className="rounded-xl flex-shrink-0 h-11 w-11">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {memories.map((memory) => (
                                <div key={memory.id} className="group relative bg-[#242424] hover:bg-[#2a2a2a] border border-border/20 rounded-2xl transition-all p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm leading-relaxed pr-8">{memory.content}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-2"
                                      onClick={() => deleteMemory(memory.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {memories.length === 0 && (
                                <div className="text-center py-16 bg-muted/5 rounded-3xl border border-dashed border-border/20">
                                  <Brain className="w-10 h-10 mx-auto mb-3 opacity-10" />
                                  <p className="text-sm text-muted-foreground font-medium">Your memory bank is empty.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 bg-muted/10 border-t border-border/20 flex justify-end">
                          <Button variant="ghost" className="rounded-xl font-bold px-8">Close</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Zeno automatically saves important facts from your conversations.
                  </p>
                </div>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground font-semibold px-0">Discard changes</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl px-10 h-12 font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">
                  {isSaving ? "Saving..." : "Apply Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">Account</h2>
                <p className="text-muted-foreground">Manage your profile and authentication status.</p>
              </div>

              <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-foreground/5 rounded-3xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black tracking-tight">{user?.displayName || userName || "Zeno User"}</div>
                    <div className="text-sm text-muted-foreground">{user?.email || "No email connected"}</div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end pt-8">
                <Button variant="outline" className="rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10 h-12 px-8 font-black">
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">About</h2>
                <p className="text-muted-foreground">Learn more about the Zeno AI ecosystem.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="font-black text-xl tracking-tight">Version 1.2.0</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">Zeno is built to provide high-performance intelligence with a focus on speed, privacy, and beautiful design.</p>
                </div>
                <div className="space-y-4">
                  <div className="font-black text-xl tracking-tight">Connect</div>
                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl bg-muted/20"><Github className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl bg-muted/20"><Twitter className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl bg-muted/20"><Linkedin className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
