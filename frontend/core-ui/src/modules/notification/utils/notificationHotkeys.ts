export const shouldIgnoreNotificationHotkey = (
  event: KeyboardEvent,
): boolean => {
  if (event.defaultPrevented) return true;

  return (
    event.target instanceof Element &&
    !!event.target.closest(
      '[role="listbox"], [role="menu"], [role="dialog"], [role="alertdialog"], [role="combobox"]',
    )
  );
};
