import { Wifi, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import bossaiRobot from "@assets/bossai-robot.png";

interface OfflineScreenProps {
  isOnline: boolean;
  isLoading?: boolean;
}

export default function OfflineScreen({ isOnline, isLoading }: OfflineScreenProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-background via-background to-muted/30 flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md">
        {/* BossAI Robot */}
        <div className="flex justify-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl w-32 h-32 mx-auto" />
            <img 
              src={bossaiRobot} 
              alt="Zeno" 
              className="h-24 w-auto relative z-10 drop-shadow-lg"
            />
          </div>
        </div>

        {!isOnline ? (
          <>
            <div className="space-y-4 animate-fade-in animation-delay-100">
              <div className="flex justify-center">
                <div className="animate-pulse">
                  <Wifi className="w-16 h-16 text-destructive/60" strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  No Connection
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Zeno is ready to chat, but needs an internet connection. Please check your connection and try again.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleRetry}
              size="lg"
              className="w-full h-12 text-base font-semibold animate-fade-in animation-delay-200 hover:scale-105 transition-transform"
              data-testid="button-retry-connection"
            >
              <RotateCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <p className="text-xs text-muted-foreground/60">
              Tip: Check WiFi or mobile data connection
            </p>
          </>
        ) : (
          <>
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Loading Zeno
                </h1>
                <p className="text-base text-muted-foreground">
                  Getting everything ready for you...
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg w-12 h-12 mx-auto animate-pulse" />
                  <div className="w-12 h-12 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin relative z-10" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
