import { describe, expect, it } from 'vite-plus/test';
import { fitTabs } from '../useTabFit';

describe('fitTabs', () => {
  it('shows every tab that fits', () => {
    expect(fitTabs([100, 100, 100], 400, false)).toEqual({ count: 3, compact: false });
  });

  it('drops icons when that lets every tab fit', () => {
    // 308 px with icons, 242 px without.
    expect(fitTabs([100, 100, 100], 250, false)).toEqual({ count: 3, compact: true });
  });

  it('leaves room for the More button when tabs overflow', () => {
    // 400 - 96 for More: two tabs of 100 fit.
    expect(fitTabs([100, 100, 100, 100], 400, true)).toEqual({ count: 2, compact: false });
  });

  it('always shows at least one tab', () => {
    expect(fitTabs([300], 100, true)).toEqual({ count: 1, compact: false });
  });
});
