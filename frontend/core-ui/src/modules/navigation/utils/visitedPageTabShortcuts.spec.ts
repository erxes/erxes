import {
  getVisitedPageTabShortcut,
  isVisitedPageTabShortcutTargetEditable,
} from '@/navigation/utils/visitedPageTabShortcuts';

describe('visited page tab shortcuts', () => {
  it.each([
    ['BracketRight', 'next'],
    ['BracketLeft', 'previous'],
    ['KeyX', 'close-all'],
  ])('maps Control+Alt+%s to %s', (code, shortcut) => {
    expect(
      getVisitedPageTabShortcut({
        altKey: true,
        code,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(shortcut);
  });

  it('supports Command+Option on macOS', () => {
    expect(
      getVisitedPageTabShortcut({
        altKey: true,
        code: 'BracketRight',
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
      }),
    ).toBe('next');
  });

  it.each([
    {
      altKey: false,
      code: 'BracketRight',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
    },
    {
      altKey: true,
      code: 'BracketRight',
      ctrlKey: true,
      metaKey: false,
      shiftKey: true,
    },
    {
      altKey: true,
      code: 'BracketRight',
      ctrlKey: true,
      metaKey: true,
      shiftKey: false,
    },
  ])('ignores unsupported modifier combinations', (event) => {
    expect(getVisitedPageTabShortcut(event)).toBeNull();
  });

  it('identifies typing and editor targets', () => {
    const contentEditable = document.createElement('div');
    contentEditable.setAttribute('contenteditable', 'true');
    const editorChild = document.createElement('span');
    contentEditable.append(editorChild);

    expect(
      isVisitedPageTabShortcutTargetEditable(document.createElement('input')),
    ).toBe(true);
    expect(
      isVisitedPageTabShortcutTargetEditable(
        document.createElement('textarea'),
      ),
    ).toBe(true);
    expect(isVisitedPageTabShortcutTargetEditable(editorChild)).toBe(true);
    expect(
      isVisitedPageTabShortcutTargetEditable(document.createElement('div')),
    ).toBe(false);
  });
});
