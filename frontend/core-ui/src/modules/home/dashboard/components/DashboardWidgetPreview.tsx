import { TDashboardWidgetPreview } from 'erxes-ui';
import { ElementType, ReactNode } from 'react';

// Theme fills, so the schematic follows light and dark mode.
const ACCENT = 'fill-primary/70';
const SOFT = 'fill-primary/25';
const MUTED = 'fill-muted-foreground/20';
const LINE = 'stroke-primary/70';

const bars = [28, 40, 22, 48, 34, 52, 30, 44];
const linePoints = '6,46 22,38 38,42 54,24 70,30 86,16 102,22 114,12';
const tableRows = [0, 1, 2, 3];
const listRows = [0, 1, 2];
const heatCells = Array.from({ length: 4 * 12 }, (_, index) => index);

const PREVIEWS: Record<TDashboardWidgetPreview, ReactNode> = {
  bar: bars.map((height, index) => (
    <rect
      key={index}
      x={8 + index * 13.5}
      y={56 - height}
      width={9}
      height={height}
      rx={1.5}
      className={index % 3 === 1 ? SOFT : ACCENT}
    />
  )),
  line: (
    <>
      {[16, 32, 48].map((y) => (
        <rect key={y} x={6} y={y} width={108} height={1} className={MUTED} />
      ))}
      <polyline
        points={linePoints}
        fill="none"
        strokeWidth={2.5}
        strokeLinejoin="round"
        className={LINE}
      />
    </>
  ),
  area: (
    <>
      <polygon points={`${linePoints} 114,56 6,56`} className={SOFT} />
      <polyline
        points={linePoints}
        fill="none"
        strokeWidth={2}
        className={LINE}
      />
    </>
  ),
  pie: (
    <>
      <circle cx={42} cy={32} r={22} className={SOFT} />
      <path d="M42 32 L42 10 A22 22 0 0 1 62 41 Z" className={ACCENT} />
      {listRows.map((row) => (
        <rect
          key={row}
          x={74}
          y={20 + row * 10}
          width={36 - row * 8}
          height={5}
          rx={2}
          className={row ? MUTED : ACCENT}
        />
      ))}
    </>
  ),
  table: (
    <>
      <rect x={6} y={8} width={108} height={7} rx={2} className={SOFT} />
      {tableRows.map((row) => (
        <g key={row}>
          <rect
            x={6}
            y={20 + row * 10}
            width={40}
            height={5}
            rx={2}
            className={MUTED}
          />
          <rect
            x={52}
            y={20 + row * 10}
            width={22}
            height={5}
            rx={2}
            className={MUTED}
          />
          <rect
            x={80}
            y={20 + row * 10}
            width={34}
            height={5}
            rx={2}
            className={row === 1 ? ACCENT : MUTED}
          />
        </g>
      ))}
    </>
  ),
  list: listRows.map((row) => (
    <g key={row}>
      <circle
        cx={12}
        cy={14 + row * 17}
        r={5}
        className={row ? SOFT : ACCENT}
      />
      <rect
        x={22}
        y={10 + row * 17}
        width={60 - row * 10}
        height={4}
        rx={2}
        className={MUTED}
      />
      <rect
        x={22}
        y={17 + row * 17}
        width={36}
        height={3}
        rx={1.5}
        className={MUTED}
      />
      <rect
        x={96}
        y={11 + row * 17}
        width={18}
        height={5}
        rx={2}
        className={SOFT}
      />
    </g>
  )),
  kpi: [0, 1, 2].map((card) => (
    <g key={card}>
      <rect
        x={6 + card * 37}
        y={12}
        width={33}
        height={40}
        rx={4}
        className={MUTED}
      />
      <rect
        x={11 + card * 37}
        y={19}
        width={16}
        height={4}
        rx={2}
        className={SOFT}
      />
      <rect
        x={11 + card * 37}
        y={30}
        width={22}
        height={10}
        rx={2}
        className={card ? SOFT : ACCENT}
      />
    </g>
  )),
  heatmap: heatCells.map((cell) => (
    <rect
      key={cell}
      x={6 + (cell % 12) * 9}
      y={12 + Math.floor(cell / 12) * 10}
      width={7}
      height={8}
      rx={1.5}
      className={[ACCENT, SOFT, MUTED, MUTED][(cell * 7) % 4]}
    />
  )),
  progress: [0, 1, 2].map((row) => (
    <g key={row}>
      <rect
        x={6}
        y={13 + row * 15}
        width={28}
        height={5}
        rx={2}
        className={MUTED}
      />
      <rect
        x={40}
        y={13 + row * 15}
        width={74}
        height={5}
        rx={2.5}
        className={MUTED}
      />
      <rect
        x={40}
        y={13 + row * 15}
        width={[58, 36, 20][row]}
        height={5}
        rx={2.5}
        className={ACCENT}
      />
    </g>
  )),
};

/** A schematic of what the widget draws, or its icon when it names none. */
export const DashboardWidgetPreview = ({
  preview,
  icon: WidgetIcon,
}: {
  preview?: TDashboardWidgetPreview;
  icon: ElementType;
}) => (
  <div className="flex aspect-[15/8] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/40">
    {preview ? (
      <svg viewBox="0 0 120 64" className="size-full" aria-hidden>
        {PREVIEWS[preview]}
      </svg>
    ) : (
      <WidgetIcon className="size-6 text-muted-foreground" />
    )}
  </div>
);
