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
    <div className="flex h-screen w-full bg-background flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <img 
            src={bossaiRobot} 
            alt="BossAI" 
            className="h-16 w-auto opacity-50"
          />
        </div>

        {!isOnline ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Wifi className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">No Connection</h1>
              <p className="text-muted-foreground">
                BossAI needs an internet connection to chat. Please check your connection and try again.
              </p>
            </div>

            <Button 
              onClick={handleRetry}
              size="lg"
              className="w-full"
              data-testid="button-retry-connection"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Loading BossAI...</h1>
              <p className="text-muted-foreground">
                Please wait while we get everything ready for you.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
