import { IconMaximize, IconMinimize } from '@tabler/icons-react';
import { type RefObject, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, PanelExpansionContext, usePageHotkey } from 'erxes-ui';

/** Whether the button is the last expand button shown, the topmost panel's. */
const isActivePanel = (button: HTMLButtonElement | null) => {
  const shown = [...document.querySelectorAll('[data-panel-expand]')].filter(
    (expand) => !expand.closest('[hidden], [inert]'),
  );

  return !!button && shown.at(-1) === button;
};

/** Ctrl/⌘ + Shift + Enter switches the topmost panel unless an editor or dialog owns the key. */
const useExpandShortcut = (
  expand: (() => void) | undefined,
  buttonRef: RefObject<HTMLButtonElement | null>,
) =>
  usePageHotkey('mod+shift+enter', () => expand?.(), {
    when: () => expand !== undefined && isActivePanel(buttonRef.current),
  });

/**
 * Switches a record between the side panel and its own page: in the panel it opens the full
 * view, on the page it puts the record back in the panel. Nothing when the record can't switch.
 */
export const PanelExpandButton = ({
  onExpand,
  expanded: controlledExpanded,
}: {
  onExpand?: () => void;
  expanded?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expansion = useContext(PanelExpansionContext);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const expand = onExpand ?? expansion?.toggle;
  const expanded = controlledExpanded ?? (!onExpand && expansion?.expanded);
  const label = expanded ? t('open-in-panel', 'Open in side panel') : t('expand', 'Open full view');

  useExpandShortcut(expand, buttonRef);

  if (!expand) return null;

  return (
    <Button
      ref={buttonRef}
      data-panel-expand
      variant="ghost"
      size="icon"
      className="size-7 flex-none"
      onClick={expand}
      title={`${label} (Ctrl/⌘ + Shift + Enter)`}
      aria-label={label}
      aria-expanded={Boolean(expanded)}
      aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
    >
      {expanded ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
    </Button>
  );
};
