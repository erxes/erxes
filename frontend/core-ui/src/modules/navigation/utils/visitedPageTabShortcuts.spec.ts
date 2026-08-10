import {
  getVisitedPageTabShortcut,
  isMacPlatform,
} from '@/navigation/utils/visitedPageTabShortcuts';

type ShortcutEvent = Parameters<typeof getVisitedPageTabShortcut>[0];

const createShortcutEvent = (
  overrides: Partial<ShortcutEvent> = {},
): ShortcutEvent => ({
  altKey: true,
  code: 'KeyT',
  ctrlKey: !isMacPlatform(),
  metaKey: isMacPlatform(),
  shiftKey: false,
  ...overrides,
});

describe('getVisitedPageTabShortcut', () => {
  it('recognizes the platform tabs-row visibility shortcut', () => {
    expect(getVisitedPageTabShortcut(createShortcutEvent())).toBe(
      'toggle-visibility',
    );
  });

  it('ignores the tabs-row visibility key without the full modifier chord', () => {
    expect(
      getVisitedPageTabShortcut(createShortcutEvent({ altKey: false })),
    ).toBeNull();
    expect(
      getVisitedPageTabShortcut(createShortcutEvent({ shiftKey: true })),
    ).toBeNull();
  });
});
