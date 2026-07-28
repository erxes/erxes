/**
 * Avatar generated from the agent's name (or extension string).
 * Uses a deterministic hue derived from the char-code sum so each agent
 * gets a consistent colour without any hardcoded palette.
 */
export function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const hue =
    Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white select-none"
      style={{
        background: `oklch(0.6 0.18 ${hue})`,
      }}
    >
      {initials || '?'}
    </span>
  );
}
