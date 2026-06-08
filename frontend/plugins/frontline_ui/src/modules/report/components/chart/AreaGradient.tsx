/**
 * Inline SVG linearGradient for Recharts <Area> fills.
 * Render inside <defs> within an <AreaChart>.
 *
 * Usage:
 *   <AreaChart>
 *     <defs>
 *       <AreaGradient id="my-grad" color="var(--primary)" />
 *     </defs>
 *     <Area fill="url(#my-grad)" ... />
 *   </AreaChart>
 */
export function AreaGradient({
  id,
  color,
  startOpacity = 0.28,
  endOpacity = 0,
}: {
  id: string;
  color: string;
  startOpacity?: number;
  endOpacity?: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={startOpacity} />
      <stop offset="95%" stopColor={color} stopOpacity={endOpacity} />
    </linearGradient>
  );
}
