export type TVisitedPageTabShortcut =
  | 'close-all'
  | 'close-current'
  | 'next'
  | 'previous';

interface IVisitedPageTabShortcutEvent {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const isMacPlatform = () =>
  typeof navigator !== 'undefined' &&
  /Macintosh|Mac OS X|iPod|iPhone|iPad/i.test(navigator.userAgent);

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const getVisitedPageTabShortcut = ({
  altKey,
  code,
  ctrlKey,
  metaKey,
  shiftKey,
}: IVisitedPageTabShortcutEvent): TVisitedPageTabShortcut | null => {
  const hasPlatformPrimaryModifier = isMacPlatform()
    ? metaKey && !ctrlKey
    : ctrlKey && !metaKey;

  if (!altKey || shiftKey || !hasPlatformPrimaryModifier) {
    return null;
  }

  if (code === 'BracketRight') {
    return 'next';
  }

  if (code === 'BracketLeft') {
    return 'previous';
  }

  if (code === 'KeyX') {
    return 'close-all';
  }

  if (code === 'KeyW') {
    return 'close-current';
  }

  return null;
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const isVisitedPageTabShortcutTargetEditable = (
  target: EventTarget | null,
) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement);
