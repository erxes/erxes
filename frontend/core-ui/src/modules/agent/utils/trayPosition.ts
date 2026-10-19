/**
 * Pure geometry for the floating agent tray: where it sits, how a drag
 * ends in a snap, and how the position persists as a height ratio so a
 * window resize lands it at the same relative spot.
 */

export const TRAY_SIZE = 52;
export const TRAY_MARGIN = 16;
/**
 * The tray never docks above this top offset — it clears the top
 * controls zone instead of covering it.
 */
export const TRAY_MIN_TOP = 56;
export const TRAY_DRAG_THRESHOLD = 4;
/** Extra clearance kept between the tray and an open right side panel. */
export const TRAY_PANEL_GAP = 16;

export type TraySide = 'left' | 'right';

export interface ITrayPosition {
  side: TraySide;
  /**
   * Vertical position as a ratio inside the clampable range
   * [TRAY_MIN_TOP, viewport - TRAY_SIZE - TRAY_MARGIN]: 0 = top, 1 = bottom.
   * A ratio survives window resizes; a px offset does not.
   */
  yRatio: number;
}

export const clampTrayTop = (top: number, viewportHeight: number): number => {
  const maxTop = Math.max(TRAY_MIN_TOP, viewportHeight - TRAY_SIZE - TRAY_MARGIN);
  return Math.min(Math.max(top, TRAY_MIN_TOP), maxTop);
};

export const topToRatio = (top: number, viewportHeight: number): number => {
  const maxTop = Math.max(TRAY_MIN_TOP, viewportHeight - TRAY_SIZE - TRAY_MARGIN);
  const span = maxTop - TRAY_MIN_TOP;
  if (span <= 0) {
    return 1;
  }
  return Math.min(Math.max((clampTrayTop(top, viewportHeight) - TRAY_MIN_TOP) / span, 0), 1);
};

export const ratioToTop = (yRatio: number, viewportHeight: number): number => {
  const maxTop = Math.max(TRAY_MIN_TOP, viewportHeight - TRAY_SIZE - TRAY_MARGIN);
  const bounded = Math.min(Math.max(yRatio, 0), 1);
  return clampTrayTop(TRAY_MIN_TOP + bounded * (maxTop - TRAY_MIN_TOP), viewportHeight);
};

/**
 * Which edge the tray snaps to after a drag: the nearer one, decided by
 * the pointer's final centre x.
 */
export const snapTraySide = (
  centreX: number,
  viewportWidth: number,
): TraySide => (centreX < viewportWidth / 2 ? 'left' : 'right');

/**
 * Resting left offset for a docked tray. `panelWidth` is only applied on
 * the right: an open side panel docks at the right edge, so the tray
 * slides left of it instead of overlapping.
 */
export const trayLeft = (
  side: TraySide,
  viewportWidth: number,
  panelWidth = 0,
): number =>
  side === 'left'
    ? TRAY_MARGIN
    : viewportWidth - TRAY_SIZE - TRAY_MARGIN - Math.max(0, panelWidth);

/** Default seat: right edge, bottom minus a small breathing margin. */
export const defaultTrayTop = (viewportHeight: number): number =>
  clampTrayTop(viewportHeight - TRAY_SIZE - 24, viewportHeight);

export const defaultTrayPosition = (
  viewportHeight: number,
): ITrayPosition => ({
  side: 'right',
  yRatio: topToRatio(defaultTrayTop(viewportHeight), viewportHeight),
});

/**
 * Read a persisted `{ side, yRatio }` back safely: storage may hold a
 * stale shape from an older build (`{ side, top }`) or hand-edited JSON.
 * Anything unrecognised falls back to a valid value rather than NaN.
 */
export const parseTrayPosition = (
  raw: unknown,
  viewportHeight: number,
): ITrayPosition => {
  const record = (raw ?? {}) as Partial<Record<keyof ITrayPosition, unknown>>;
  const side: TraySide = record.side === 'left' ? 'left' : 'right';
  const yRatio =
    typeof record.yRatio === 'number' && Number.isFinite(record.yRatio)
      ? Math.min(Math.max(record.yRatio, 0), 1)
      : defaultTrayPosition(viewportHeight).yRatio;
  return { side, yRatio };
};
