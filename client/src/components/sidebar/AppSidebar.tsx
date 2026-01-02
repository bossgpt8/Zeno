import { Zap, Plus, User, LogOut, Search, Settings, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConversationList } from "./ConversationList";
import { ModelSelector } from "./ModelSelector";
import { useChatStore } from "@/lib/store";
import { isFirebaseConfigured, signInWithGoogle, signOutUser, signInWithEmail, signUpWithEmail, deleteConversation as deleteCloudConversation } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const {
    user,
    currentConversationId,
    currentModel,
    searchQuery,
    customSystemPrompt,
    hasSeenAuthPrompt,
    hasAcceptedLocalStorage,
    setHasSeenAuthPrompt,
    setHasAcceptedLocalStorage,
    setCurrentConversationId,
    setCurrentModel,
    setSearchQuery,
    setCustomSystemPrompt,
    createNewConversation,
    deleteConversation,
    togglePinConversation,
    getFilteredConversations,
  } = useChatStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(customSystemPrompt);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  const conversations = getFilteredConversations();

  // Auto-open auth dialog for new users
  useState(() => {
    if (!user && !hasSeenAuthPrompt && !authOpen) {
      setAuthOpen(true);
      setHasSeenAuthPrompt(true);
    }
  });

  const handleNewChat = () => {
    createNewConversation();
    onClose();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    onClose();
  };

  const handleDeleteConversation = async (id: string) => {
    deleteConversation(id);
    if (user?.uid) {
      try {
        await deleteCloudConversation(user.uid, id);
      } catch (error) {
        console.error("Error deleting conversation from cloud:", error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      setAuthOpen(false);
    } catch (error: any) {
      toast({
        title: "Whoops!",
        description: "We couldn't sign you in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({
          title: "Check your password",
          description: "The passwords you entered don't match. Give it another look!",
          variant: "destructive",
        });
        return;
      }
      if (!agreedToTerms) {
        toast({
          title: "Almost there!",
          description: "Please check the box to agree to our Terms and Privacy Policy to continue.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setAuthOpen(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "We couldn't sign you in with those details. Please double-check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleContinueAsGuest = () => {
    setShowWarning(true);
  };

  const handleConfirmGuest = () => {
    setHasAcceptedLocalStorage(true);
    setShowWarning(false);
    setAuthOpen(false);
  };

  const handleSaveSystemPrompt = () => {
    setCustomSystemPrompt(tempPrompt);
    setSettingsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      <aside
        className={`w-72 bg-sidebar border-r border-sidebar-border flex flex-col fixed lg:relative inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        data-testid="sidebar"
      >
        <div className="p-4 md:p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <span className="text-base md:text-lg font-bold text-sidebar-foreground">Zeno</span>
          </div>
          
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 mb-3 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
              data-testid="input-search-chats"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">
            {searchQuery ? "Search Results" : "Chats"}
          </div>
          <ConversationList
            conversations={conversations}
            currentId={currentConversationId}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
            onTogglePin={togglePinConversation}
          />
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-card-border">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate text-foreground">
                  {user.displayName || user.email || "User"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="flex-shrink-0"
                  data-testid="button-sign-out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground text-center px-2">
                All your chats are safe in the cloud
              </div>
            </div>
          ) : (isFirebaseConfigured || !!import.meta.env.VITE_FIREBASE_API_KEY) ? (
            <div className="space-y-3">
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    data-testid="button-sign-in"
                  >
                    <User className="w-4 h-4" />
                    Sign In / Register
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{isSignUp ? "Create an Account" : "Sign In"}</DialogTitle>
                    <DialogDescription>
                      Choose your preferred authentication method.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-9"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">{isSignUp ? "Create Password" : "Password"}</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-9 pr-10 relative z-0"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <div className="absolute right-0 top-0 h-full flex items-center pr-1 z-10">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-9 pr-10 relative z-0"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                            <div className="absolute right-0 top-0 h-full flex items-center pr-1 z-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-transparent z-10"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {isSignUp && (
                        <div className="flex items-start gap-2 pt-2">
                          <Checkbox 
                            id="terms" 
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                          />
                          <Label htmlFor="terms" className="text-xs leading-none cursor-pointer">
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                      )}
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                      </Button>
                    </form>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full gap-2" 
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>

                    <div className="text-center text-sm">
                      <button
                        type="button"
                        className="text-primary hover:underline underline-offset-4"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                      </button>
                    </div>

                    {!isSignUp && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full text-xs text-muted-foreground hover:text-foreground"
                          onClick={handleContinueAsGuest}
                        >
                          Continue without signing in
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <div className="text-[10px] text-muted-foreground text-center px-2">
                {hasAcceptedLocalStorage ? "Your chats are only saved on this device" : "Sign in to keep your chats forever"}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center p-2">
              {hasAcceptedLocalStorage ? "Chats saved locally" : "Sign in to sync chats"}
            </div>
          )}

          {/* Local Storage Warning Dialog */}
          <Dialog open={showWarning} onOpenChange={setShowWarning}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-500">
                  <Zap className="h-5 w-5" />
                  Local Storage Notice
                </DialogTitle>
                <DialogDescription className="pt-2">
                  Your chats will be saved <strong>only on this device</strong>. 
                  <br /><br />
                  <span className="text-destructive font-semibold">Risk:</span> If you clear your browser data, reset your device, or use a different browser, your entire conversation history will be permanently lost.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                  <Checkbox 
                    id="understand" 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Just for visual feedback
                      }
                    }}
                  />
                  <Label htmlFor="understand" className="text-xs leading-normal cursor-pointer">
                    I understand that my data is not synced and may be lost if I clear my browser.
                  </Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowWarning(false)}>
                    Back
                  </Button>
                  <Button onClick={handleConfirmGuest}>
                    I Understand, Confirm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="flex gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => setTempPrompt(customSystemPrompt)}
                  data-testid="button-settings"
                  className="w-full gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Custom Instructions</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Custom Instructions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">Custom System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      placeholder="Add custom instructions for how Zeno should respond..."
                      value={tempPrompt}
                      onChange={(e) => setTempPrompt(e.target.value)}
                      className="min-h-[150px]"
                      data-testid="textarea-system-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be added to every conversation to customize AI responses.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setSettingsOpen(false)}
                      data-testid="button-cancel-settings"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveSystemPrompt}
                      data-testid="button-save-settings"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </aside>
    </>
  );
}
