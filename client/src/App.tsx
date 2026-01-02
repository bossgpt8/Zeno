import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { Analytics } from "@vercel/analytics/react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useChatStore } from "@/lib/store";
import { subscribeToAuth } from "@/lib/firebase";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { AI_MODELS } from "@shared/schema";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import OfflineScreen from "@/pages/offline";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useChatStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentModel, setCurrentModel } = useChatStore();

  useEffect(() => {
    // Validate model is still available, reset if not
    const validIds = new Set<string>();
    Object.values(AI_MODELS).forEach((category) => {
      category.forEach((model) => {
        validIds.add(model.id);
      });
    });
    
    if (currentModel && !validIds.has(currentModel)) {
      setCurrentModel("meta-llama/llama-3.3-70b-instruct:free");
    }
  }, [currentModel, setCurrentModel]);

  useEffect(() => {
    // Initialize Google Analytics
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    }

    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.debug('Service worker registration failed:', error);
      });
    }

    // Set initialized after a brief delay to ensure app is ready
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show offline screen if no internet connection on initial launch
  if (!isOnline && !isInitialized) {
    return (
      <ThemeProvider>
        <OfflineScreen isOnline={false} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
