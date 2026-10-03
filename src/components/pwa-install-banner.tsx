import { useState } from "react";
import { Download, X, Share } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallBanner() {
  const { canInstall, installed, isIos, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (installed || dismissed) return null;
  if (!canInstall && !isIos) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 rounded-2xl border border-primary/30 bg-card p-4 shadow-elevated md:left-auto md:right-6 md:w-96">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 font-display text-lg">Install SnapPots App</p>
      {isIos && !canInstall ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          Tap <Share className="h-4 w-4" /> then “Add to Home Screen”.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Full-screen, offline-ready, no app store needed.
          </p>
          <button
            onClick={() => void install()}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> Install
          </button>
        </>
      )}
    </div>
  );
}
