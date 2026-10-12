import { isCodeFormattingShortcut } from '../isCodeFormattingShortcut';

describe('code formatting keyboard guard', () => {
  it.each(['b', 'B', 'i', 'I', 'u', 'U', 'k'])('guards Control+%s', (key) => {
    expect(
      isCodeFormattingShortcut({
        key,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(true);
  });

  it('guards Command+Shift+S for strikethrough', () => {
    expect(
      isCodeFormattingShortcut({
        key: 'S',
        ctrlKey: false,
        metaKey: true,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe(true);
  });

  it.each(['e', 'c', 'v', 'z', 's', 'ArrowLeft'])(
    'allows Control+%s',
    (key) => {
      expect(
        isCodeFormattingShortcut({
          key,
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false,
        }),
      ).toBe(false);
    },
  );

  it('allows ordinary typing', () => {
    expect(
      isCodeFormattingShortcut({
        key: 'b',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false);
  });
});
