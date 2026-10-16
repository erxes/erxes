import type { FormattingShortcut } from 'erxes-ui/modules/blocks/types/toolbar/FormattingShortcut';

export const isCodeFormattingShortcut = (
  event: FormattingShortcut,
): boolean => {
  const key = event.key.toLowerCase();

  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    (['b', 'i', 'u', 'k'].includes(key) || (event.shiftKey && key === 's'))
  );
};
