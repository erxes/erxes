import { describe, expect, it } from 'vite-plus/test';
import { unknownSelectors } from './plugin-styles';

describe('unknownSelectors', () => {
  it("keeps the selectors of a merged rule whose class the page lacks, and drops the page's", () => {
    // HR's minified Tailwind: web has `bg-info/10`, so only `bg-info` may go in solid.
    const known = new Set(['bg-info\\/10']);

    expect(unknownSelectors('.bg-info, .bg-info\\/10', known)).toEqual(['.bg-info']);
  });

  it('keeps none when the page has every class in the list', () => {
    const known = new Set(['bg-info', 'bg-info\\/10']);

    expect(unknownSelectors('.bg-info, .bg-info\\/10', known)).toEqual([]);
  });

  it('judges a selector with a variant by its own class', () => {
    const known = new Set(['md\\:flex']);

    expect(unknownSelectors('.md\\:flex:hover, .md\\:grid', known)).toEqual(['.md\\:grid']);
  });

  it('keeps a list inside a pseudo-class as one selector', () => {
    const known = new Set(['space-y-2']);

    expect(unknownSelectors(':where(.space-y-2 > :not(:last-child), .other)', known)).toEqual([]);
    expect(unknownSelectors(':where(.space-y-2 > :not(:last-child), .other)', new Set())).toEqual([
      ':where(.space-y-2 > :not(:last-child), .other)',
    ]);
  });

  it('splits at no escaped comma, and keeps a selector with no class', () => {
    const known = new Set(['a\\,b']);

    expect(unknownSelectors('.a\\,b, :root', known)).toEqual([':root']);
  });
});
