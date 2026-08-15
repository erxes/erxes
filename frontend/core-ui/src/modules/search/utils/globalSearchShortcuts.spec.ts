import {
  getGlobalSearchCategoryShortcut,
  isGlobalSearchOpenShortcut,
} from '@/search/utils/globalSearchShortcuts';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';

const createEvent = (
  overrides: Partial<Parameters<typeof isGlobalSearchOpenShortcut>[0]> = {},
) => ({
  altKey: false,
  code: 'KeyM',
  ctrlKey: !isMacPlatform(),
  metaKey: isMacPlatform(),
  shiftKey: false,
  ...overrides,
});

describe('global search shortcuts', () => {
  it('opens from the sidebar Go to shortcut only', () => {
    expect(isGlobalSearchOpenShortcut(createEvent())).toBe(true);
    expect(
      isGlobalSearchOpenShortcut(createEvent({ altKey: true, code: 'KeyK' })),
    ).toBe(false);
  });

  it('maps primary-modifier digits to categories', () => {
    const categories = ['all', 'go-to', 'projects', 'tickets'];

    expect(
      getGlobalSearchCategoryShortcut(
        createEvent({ code: 'Digit1' }),
        categories,
      ),
    ).toBe('all');
    expect(
      getGlobalSearchCategoryShortcut(
        createEvent({ code: 'Digit4' }),
        categories,
      ),
    ).toBe('tickets');
    expect(
      getGlobalSearchCategoryShortcut(
        createEvent({ code: 'Digit5' }),
        categories,
      ),
    ).toBeNull();
  });
});
