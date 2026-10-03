import icon from "@/assets/snappots-icon.png";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src={icon}
      alt="SnapPots"
      width={1024}
      height={1024}
      className={`${className} rounded-xl object-cover`}
      loading="eager"
    />
  );
}

export function Wordmark({ size = "text-xl" }: { size?: string }) {
  return (
    <span className={`font-display tracking-tight ${size}`}>
      <span className="text-foreground">Snap</span>
      <span className="text-primary">Pots</span>
    </span>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark />
      <Wordmark />
    </div>
  );
}
