import {
  countNavigationMenuItems,
  getNavigationPlacement,
  NAVIGATION_INLINE_ITEM_LIMIT,
} from '@/navigation/utils/navigationPlacement';

const renderMenu = (html: string) => {
  const root = document.createElement('div');

  root.innerHTML = html;

  return root;
};

const item = (label: string) =>
  `<li data-sidebar="menu-item"><a>${label}</a></li>`;

describe('navigation placement', () => {
  it('keeps a plugin inline up to the limit and moves it past it', () => {
    expect(getNavigationPlacement(NAVIGATION_INLINE_ITEM_LIMIT)).toBe('inline');
    expect(getNavigationPlacement(NAVIGATION_INLINE_ITEM_LIMIT + 1)).toBe(
      'context',
    );
  });

  it('keeps a plugin with sub groups inline whatever its count', () => {
    expect(getNavigationPlacement(NAVIGATION_INLINE_ITEM_LIMIT + 3, true)).toBe(
      'inline',
    );
  });

  it('keeps a plugin whose count is not known yet inline', () => {
    expect(getNavigationPlacement(undefined)).toBe('inline');
  });

  it('counts the links of the menu, including ones wrapped in a div', () => {
    const root = renderMenu(
      `<ul data-sidebar="menu">${item('Vouchers')}<div>${item(
        'Lotteries',
      )}${item('Spins')}</div></ul>`,
    );

    expect(countNavigationMenuItems(root)).toBe(3);
  });

  it('does not count items of a menu nested under a link', () => {
    const root = renderMenu(
      `<ul data-sidebar="menu">${item('Records')}<ul data-sidebar="menu">${item(
        'Journal A',
      )}${item('Journal B')}</ul>${item('Reports')}</ul>`,
    );

    expect(countNavigationMenuItems(root)).toBe(2);
  });

  it('counts nothing before the menu has rendered', () => {
    expect(countNavigationMenuItems(renderMenu('<div></div>'))).toBe(0);
  });
});
