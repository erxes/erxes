import { useEffect } from 'react';

/** A single-letter page shortcut (`C` adds, `F` filters): runs `action` unless typing somewhere or a dialog or menu is open. */
export const usePageHotkey = (key: string, action: () => void) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;

      if (
        event.key.toLowerCase() === key &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.repeat &&
        !target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]',
        ) &&
        !document.querySelector('[role="dialog"][data-state="open"]')
      ) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [key, action]);
};
