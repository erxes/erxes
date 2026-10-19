import {
  clampTrayTop,
  defaultTrayPosition,
  defaultTrayTop,
  parseTrayPosition,
  ratioToTop,
  snapTraySide,
  topToRatio,
  trayLeft,
  TRAY_MARGIN,
  TRAY_MIN_TOP,
  TRAY_SIZE,
} from '../utils/trayPosition';

describe('trayPosition', () => {
  describe('clampTrayTop', () => {
    it('clamps inside [min, viewport - size - margin]', () => {
      expect(clampTrayTop(10, 800)).toBe(TRAY_MIN_TOP);
      expect(clampTrayTop(400, 800)).toBe(400);
      expect(clampTrayTop(900, 800)).toBe(800 - TRAY_SIZE - TRAY_MARGIN);
    });

    it('holds on a viewport smaller than the tray span', () => {
      // maxTop collapses to TRAY_MIN_TOP — never below it.
      expect(clampTrayTop(300, 60)).toBe(TRAY_MIN_TOP);
      expect(clampTrayTop(0, 60)).toBe(TRAY_MIN_TOP);
    });
  });

  describe('top/ratio round-trip', () => {
    it('returns the same top for any in-range value', () => {
      for (const top of [56, 200, 500, 732]) {
        expect(ratioToTop(topToRatio(top, 800), 800)).toBe(top);
      }
    });

    it('re-centres the tray on a different viewport height', () => {
      const ratio = topToRatio(400, 800);
      // mid-ratio keeps the mid position relative to the clampable span
      expect(ratioToTop(ratio, 400)).toBeCloseTo(
        TRAY_MIN_TOP + ratio * (400 - TRAY_SIZE - TRAY_MARGIN - TRAY_MIN_TOP),
      );
    });

    it('clamps out-of-range ratios', () => {
      expect(ratioToTop(-1, 800)).toBe(TRAY_MIN_TOP);
      expect(ratioToTop(2, 800)).toBe(800 - TRAY_SIZE - TRAY_MARGIN);
    });
  });

  describe('snapTraySide', () => {
    it('snaps to the nearer edge by centre x', () => {
      expect(snapTraySide(100, 1000)).toBe('left');
      expect(snapTraySide(499, 1000)).toBe('left');
      expect(snapTraySide(500, 1000)).toBe('right');
      expect(snapTraySide(900, 1000)).toBe('right');
    });
  });

  describe('trayLeft', () => {
    it('docks left at the margin', () => {
      expect(trayLeft('left', 1000)).toBe(TRAY_MARGIN);
    });

    it('docks right at viewport - size - margin', () => {
      expect(trayLeft('right', 1000)).toBe(1000 - TRAY_SIZE - TRAY_MARGIN);
    });

    it('slides left by the panel width plus gap on the right', () => {
      expect(trayLeft('right', 1000, 436)).toBe(
        1000 - TRAY_SIZE - TRAY_MARGIN - 436,
      );
      // never applied on the left dock
      expect(trayLeft('left', 1000, 436)).toBe(TRAY_MARGIN);
    });
  });

  describe('defaultTrayPosition', () => {
    it('docks right near the bottom', () => {
      const pos = defaultTrayPosition(800);
      expect(pos.side).toBe('right');
      expect(ratioToTop(pos.yRatio, 800)).toBe(defaultTrayTop(800));
      // within the clampable range
      expect(pos.yRatio).toBeGreaterThanOrEqual(0);
      expect(pos.yRatio).toBeLessThanOrEqual(1);
    });
  });

  describe('parseTrayPosition', () => {
    it('passes a stored position through unchanged', () => {
      expect(
        parseTrayPosition({ side: 'left', yRatio: 0.25 }, 900),
      ).toEqual({ side: 'left', yRatio: 0.25 });
    });

    it('rebuilds a stale shape from an older build', () => {
      const parsed = parseTrayPosition({ side: 'left', top: 700 }, 900);
      expect(parsed.side).toBe('left');
      expect(Number.isFinite(parsed.yRatio)).toBe(true);
      expect(parsed.yRatio).toBeGreaterThanOrEqual(0);
      expect(parsed.yRatio).toBeLessThanOrEqual(1);
    });

    it('rejects non-finite and out-of-range ratios', () => {
      for (const bad of [NaN, Infinity, 'x', null, 4, -2]) {
        const parsed = parseTrayPosition({ side: 'right', yRatio: bad }, 900);
        expect(Number.isFinite(parsed.yRatio)).toBe(true);
        expect(parsed.yRatio).toBeGreaterThanOrEqual(0);
        expect(parsed.yRatio).toBeLessThanOrEqual(1);
      }
    });

    it('normalises a missing or unknown side to right', () => {
      expect(parseTrayPosition({}, 900).side).toBe('right');
      expect(parseTrayPosition({ side: 'top' }, 900).side).toBe('right');
      expect(parseTrayPosition('junk', 900).side).toBe('right');
      expect(parseTrayPosition(null, 900).side).toBe('right');
    });
  });
});
