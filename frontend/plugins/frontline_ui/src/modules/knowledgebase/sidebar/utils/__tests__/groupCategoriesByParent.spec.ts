import {
  groupCategoriesByParent,
  ROOT_CATEGORY_KEY,
  TCategoryNode,
} from '../groupCategoriesByParent';

const category = (
  _id: string,
  title: string,
  parentCategoryId?: string,
): TCategoryNode => ({
  _id,
  title,
  parentCategoryId: parentCategoryId ?? null,
});

const titlesOf = (groups: Map<string, TCategoryNode[]>, key: string) =>
  (groups.get(key) ?? []).map((item) => item.title);

const countAll = (groups: Map<string, TCategoryNode[]>) =>
  [...groups.values()].reduce((total, group) => total + group.length, 0);

describe('groupCategoriesByParent', () => {
  it('returns an empty map for no categories', () => {
    expect(groupCategoriesByParent([]).size).toBe(0);
  });

  it('groups children under their parent and sorts each level by title', () => {
    const groups = groupCategoriesByParent([
      category('billing', 'Billing'),
      category('refunds', 'Refunds', 'billing'),
      category('invoices', 'Invoices', 'billing'),
      category('api', 'API'),
    ]);

    expect(titlesOf(groups, ROOT_CATEGORY_KEY)).toEqual(['API', 'Billing']);
    expect(titlesOf(groups, 'billing')).toEqual(['Invoices', 'Refunds']);
  });

  it('sorts titles numerically', () => {
    const groups = groupCategoriesByParent([
      category('c10', 'Step 10'),
      category('c2', 'Step 2'),
      category('c1', 'Step 1'),
    ]);

    expect(titlesOf(groups, ROOT_CATEGORY_KEY)).toEqual([
      'Step 1',
      'Step 2',
      'Step 10',
    ]);
  });

  it('keeps nesting deeper than one level', () => {
    const groups = groupCategoriesByParent([
      category('access', 'Access'),
      category('twofa', 'Two-factor', 'access'),
      category('apps', 'Authenticator apps', 'twofa'),
    ]);

    expect(titlesOf(groups, 'access')).toEqual(['Two-factor']);
    expect(titlesOf(groups, 'twofa')).toEqual(['Authenticator apps']);
  });

  it('puts a category whose parent is missing at the root', () => {
    const groups = groupCategoriesByParent([
      category('orphan', 'Orphan', 'deleted-parent'),
      category('root', 'Root', ''),
    ]);

    expect(titlesOf(groups, ROOT_CATEGORY_KEY)).toEqual(['Orphan', 'Root']);
  });

  it('places every category exactly once when parents form a cycle', () => {
    const groups = groupCategoriesByParent([
      category('a', 'A', 'b'),
      category('b', 'B', 'a'),
    ]);

    expect(countAll(groups)).toBe(2);
    expect(titlesOf(groups, ROOT_CATEGORY_KEY)).toEqual(['A']);
    expect(titlesOf(groups, 'a')).toEqual(['B']);
  });

  it('places a self-parented category at the root without nesting it', () => {
    const groups = groupCategoriesByParent([category('self', 'Self', 'self')]);

    expect(countAll(groups)).toBe(1);
    expect(titlesOf(groups, ROOT_CATEGORY_KEY)).toEqual(['Self']);
    expect(groups.has('self')).toBe(false);
  });
});
