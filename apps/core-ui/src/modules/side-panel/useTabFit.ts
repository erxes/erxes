import { useCallback, useLayoutEffect, useRef, useState } from 'react';

// Tab bar layout, in px: the gap between triggers, the "+N More" button, and
// a tab's width before it was ever shown.
const TAB_GAP = 4;
const MORE_BUTTON_WIDTH = 96;
const TAB_FALLBACK_WIDTH = 104;

/** A tab's icon and the gap after it: dropped when that lets every tab fit. */
const TAB_ICON_SPACE = 22;

/**
 * How many of the tabs (their widths with icons, in order) fit `available` px, leaving room
 * for the More button when some tabs don't fit or `moreTabs` are hidden anyway. `compact`:
 * all fit once their icons are dropped.
 */
export const fitTabs = (widths: number[], available: number, moreTabs: boolean) => {
  const total = widths.reduce((sum, width) => sum + width, 0) + TAB_GAP * (widths.length - 1);

  if (!moreTabs && total > available && total - TAB_ICON_SPACE * widths.length <= available) {
    return { count: widths.length, compact: true };
  }

  const budget = moreTabs || total > available ? available - MORE_BUTTON_WIDTH : available;
  let used = 0;
  let count = 0;

  for (const width of widths) {
    const next = used + (count ? TAB_GAP : 0) + width;

    if (next > budget) break;
    used = next;
    count += 1;
  }

  return { count: Math.max(1, count), compact: false };
};

const innerWidth = (element: HTMLElement) => {
  const style = getComputedStyle(element);

  return (
    element.clientWidth -
    (parseFloat(style.paddingLeft) || 0) -
    (parseFloat(style.paddingRight) || 0)
  );
};

/** A trigger drawn without its icon (compact) still counts it, so compact never looks roomier. */
const widthWithIcon = (trigger: HTMLElement) => {
  const icon = trigger.querySelector('svg');

  return trigger.offsetWidth + (icon && icon.getClientRects().length === 0 ? TAB_ICON_SPACE : 0);
};

/**
 * Measures the tab bar and its triggers: how many of the first `visibleCount` tabs fit
 * beside the More button, and whether dropping icons lets them all fit. Re-measures when
 * the bar resizes or triggers come and go; each tab's width is kept once seen.
 */
export const useTabFit = ({
  tabValues,
  visibleCount,
  active,
}: {
  /** The tabs in the bar, in order. */
  tabValues: string[];
  visibleCount: number;
  /** False while the bar isn't a row (expanded sidebar): nothing to fit. */
  active: boolean;
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const tabWidths = useRef(new Map<string, number>());
  const [fit, setFit] = useState({ count: visibleCount, compact: false });
  const valuesKey = tabValues.join('\n');

  const measure = useCallback(() => {
    const bar = barRef.current;

    // A hidden panel (an entry below the top of the record stack) measures
    // 0px; keep the last real widths until it is shown again.
    if (!bar || !active || bar.clientWidth === 0) return;

    bar.querySelectorAll<HTMLElement>('[data-panel-tab]').forEach((trigger) => {
      if (trigger.offsetWidth > 0) {
        tabWidths.current.set(trigger.dataset.panelTab ?? '', widthWithIcon(trigger));
      }
    });

    const values = valuesKey ? valuesKey.split('\n') : [];

    const widths = values
      .slice(0, visibleCount)
      .map((value) => tabWidths.current.get(value) ?? TAB_FALLBACK_WIDTH);

    const next = fitTabs(widths, innerWidth(bar), values.length > visibleCount);

    setFit((current) =>
      current.count === next.count && current.compact === next.compact ? current : next,
    );
  }, [valuesKey, visibleCount, active]);

  useLayoutEffect(() => {
    const bar = barRef.current;

    measure();

    if (!bar || typeof ResizeObserver === 'undefined') return undefined;

    let frame = 0;

    // Measured in the next frame, outside the observer callback.
    const resized = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });

    // Tabs shown for the first time are measured once drawn; their real width
    // then settles the count (each width is measured once, so it converges).
    const redrawn = new MutationObserver(measure);

    resized.observe(bar);
    redrawn.observe(bar, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      redrawn.disconnect();
    };
  }, [measure]);

  return { barRef, fitCount: Math.min(visibleCount, fit.count), compact: fit.compact };
};
