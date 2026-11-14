import { type Keys, useHotkeys } from 'react-hotkeys-hook';

// While one of these is shown, it owns the keyboard.
const OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

/**
 * Keys meant for something else: a repeat, an IME composition, a key a handler already took,
 * one typed into a text box, or any key while an overlay is shown. react-hotkeys-hook already
 * skips inputs, textareas, selects and contenteditable editors.
 */
const meantElsewhere = (event: KeyboardEvent) =>
  event.repeat ||
  event.isComposing ||
  event.defaultPrevented ||
  (event.target instanceof Element && event.target.closest('[role="textbox"]') !== null) ||
  Array.from(document.querySelectorAll(OVERLAY)).some(
    (overlay) => overlay.getClientRects().length > 0,
  );

/**
 * A page shortcut (`c` adds, `f` filters, `/` focuses the description, `mod+shift+enter`
 * expands the panel): runs `action` unless someone is typing or a dialog or menu is open.
 * `when` decides per key press whether this hook takes it at all, so another one may.
 * `useKey` matches the character typed instead of the key's position (`/` on any layout).
 */
export const usePageHotkey = (
  keys: Keys,
  action: () => void,
  { when, useKey }: { when?: () => boolean; useKey?: boolean } = {},
) =>
  useHotkeys(keys, action, {
    useKey,
    preventDefault: true,
    ignoreEventWhen: (event) => meantElsewhere(event) || when?.() === false,
  });
