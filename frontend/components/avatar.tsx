import Image from "next/image";

export function Avatar({ username, src, size = 40 }: { username: string; src?: string | null; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={`${username} avatar`}
        width={size}
        height={size}
        className="rounded-full border border-border bg-muted"
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs text-primary"
      style={{ width: size, height: size }}
      aria-label={`${username} avatar`}
    >
      {initials}
    </div>
  );
}
