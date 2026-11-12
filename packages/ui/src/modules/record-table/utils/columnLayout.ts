/**
 * Fits a saved column order to the current columns: removed columns drop out, and a new
 * column goes where it is defined (after the nearest column before it), not at the end.
 */
export const mergeColumnOrder = (saved: string[], ids: string[]) => {
  const known = saved.filter((id) => ids.includes(id));

  if (known.length === saved.length && known.length === ids.length) return saved;

  const result = [...known];

  ids.forEach((id, index) => {
    if (result.includes(id)) return;

    const before = ids.slice(0, index).findLast((other) => result.includes(other));

    result.splice(before === undefined ? 0 : result.indexOf(before) + 1, 0, id);
  });

  return result;
};

/** Pins each `fresh` column after the pinned column that comes before it in `sticky`. */
export const pinColumns = (left: string[], fresh: string[], sticky: string[]) => {
  const result = [...left];

  for (const id of fresh) {
    if (result.includes(id)) continue;

    const before = sticky.slice(0, sticky.indexOf(id)).findLast((other) => result.includes(other));

    result.splice(before === undefined ? result.length : result.indexOf(before) + 1, 0, id);
  }

  return result;
};

/** Structural columns (checkbox, more) stay first whenever any column is pinned. */
export const withStructuralFirst = (left: string[], structural: string[]) => {
  const missing = structural.filter((id) => !left.includes(id));

  return left.length && missing.length ? [...missing, ...left] : left;
};

/** Identifies the columns and sticky columns a layout is fitted to. */
export const fitKey = (ids: string[], sticky: string[]) => [...ids, '|', ...sticky].join(',');

export interface ColumnLayout {
  /** The column ids and sticky columns the layout was last fitted to. */
  fittedTo: string;
  columnOrder: string[];
  columnPinning: { left?: string[]; right?: string[] };
  /** Columns the layout has seen: a column added later is new. */
  seen: string[];
  /** What was meant to stick at the last fit; older saved layouts didn't say. */
  sticky?: string[];
  /** Set once the member pins or unpins a column. */
  pinningTouched: boolean;
}

/**
 * Fits the layout to the current columns. Until the member changes the pinning (or a saved one
 * exists) the pinned columns follow `sticky`; after that only a column that newly became sticky
 * is pinned, once, so a column the member unpinned stays unpinned.
 */
export const fitLayout = (
  layout: ColumnLayout,
  { ids, sticky, followSticky }: { ids: string[]; sticky: string[]; followSticky: boolean },
): ColumnLayout => {
  const fresh = sticky.filter(
    (id) => ids.includes(id) && (!layout.seen.includes(id) || !layout.sticky?.includes(id)),
  );

  const left = followSticky && !layout.pinningTouched ? sticky : (layout.columnPinning.left ?? []);

  return {
    ...layout,
    fittedTo: fitKey(ids, sticky),
    columnOrder: mergeColumnOrder(layout.columnOrder, ids),
    columnPinning: { ...layout.columnPinning, left: pinColumns(left, fresh, sticky) },
    seen: [...new Set([...layout.seen, ...ids])],
    sticky,
  };
};
