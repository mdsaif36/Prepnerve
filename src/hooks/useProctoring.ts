import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseProctoringProps {
  active: boolean;
  enableTabSwitchDetection?: boolean;
  enableFullScreen?: boolean;
  disableCopyPaste?: boolean;
  maxViolations?: number;
  onTerminate?: () => void;
}

export function useProctoring({
  active,
  enableTabSwitchDetection = true,
  enableFullScreen = true,
  disableCopyPaste = true,
  maxViolations = 2,
  onTerminate,
}: UseProctoringProps) {
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(true); // Default true to prevent flash
  const [lastViolationType, setLastViolationType] = useState<string | null>(null);
  
  // ✅ FIX 1: Grace Period (Safe Zone)
  // We ignore violations in the first 5 seconds to allow full screen to trigger properly
  const isGracePeriod = useRef(true);

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        isGracePeriod.current = false;
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [active]);

  // Handle Violations
  const handleViolation = useCallback((type: string) => {
    if (!active || isGracePeriod.current) return; 

    setLastViolationType(type);
    setViolationCount((prev) => {
      const newCount = prev + 1;
      
      if (newCount >= maxViolations) {
        if (onTerminate) onTerminate();
      } else {
         toast.warning(`⚠️ Warning ${newCount}/${maxViolations}: ${type}`);
      }
      return newCount;
    });
  }, [active, maxViolations, onTerminate]);

  // 1. Tab Switch Detection
  useEffect(() => {
    if (!active || !enableTabSwitchDetection) return;
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation("Tab Switch Detected");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [active, enableTabSwitchDetection, handleViolation]);

  // 2. Full Screen Logic
  const triggerFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      console.error("FS Error:", err);
    }
  };

  useEffect(() => {
    if (!active || !enableFullScreen) return;

    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      
      // ✅ FIX 2: If user exits full screen, just pause UI (don't count strike yet)
      // The Lock Screen in the main component will force them back.
      if (!isFull && !isGracePeriod.current) {
         // Optional: You can count a strike here if you want to be very strict
         // handleViolation("Exited Full Screen");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    
    // Auto-trigger on mount
    const timer = setTimeout(() => triggerFullScreen(), 1000);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      clearTimeout(timer);
    };
  }, [active, enableFullScreen]);

  // 3. Disable Copy/Paste
  useEffect(() => {
    if (!active || !disableCopyPaste) return;
    const preventDefault = (e: Event) => {
      e.preventDefault();
      handleViolation("Copy/Paste Attempted");
    };
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("cut", preventDefault);
    return () => {
        document.removeEventListener("contextmenu", preventDefault);
        document.removeEventListener("copy", preventDefault);
        document.removeEventListener("paste", preventDefault);
        document.removeEventListener("cut", preventDefault);
    };
  }, [active, disableCopyPaste, handleViolation]);

  return { 
    violationCount, 
    triggerFullScreen, 
    isFullScreen,
    lastViolationType 
  };
}