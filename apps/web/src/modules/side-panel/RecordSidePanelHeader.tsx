import { IconChevronLeft, IconMaximize, IconMinimize, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { type RefObject, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelExpansionContext } from './panelExpansion';
import type { RecordSidePanelHeaderProps } from './recordSidePanelTypes';

const EDITING = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
].join(', ');

const OPEN_OVERLAY =
  '[role="dialog"][data-state="open"], [role="menu"][data-state="open"], [role="listbox"][data-state="open"]';

const isExpandShortcut = (event: KeyboardEvent) =>
  !event.defaultPrevented &&
  !event.repeat &&
  !event.isComposing &&
  event.key === 'Enter' &&
  event.shiftKey &&
  (event.ctrlKey || event.metaKey) &&
  !event.altKey;

/** Whether the button sits in the topmost panel, shown, with no overlay open. */
const isActivePanel = (button: HTMLButtonElement | null) => {
  const panels = document.querySelectorAll('[data-record-side-panel]');

  return (
    !!button &&
    !button.closest('[hidden], [inert]') &&
    button.closest('[data-record-side-panel]') === panels[panels.length - 1] &&
    !document.querySelector(OPEN_OVERLAY)
  );
};

/** Ctrl/⌘ + Shift + Enter expands the active panel unless an editor or dialog owns the key. */
const useExpandShortcut = (
  expand: (() => void) | undefined,
  buttonRef: RefObject<HTMLButtonElement | null>,
) => {
  useEffect(() => {
    if (!expand) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isExpandShortcut(event)) return;

      if (event.target instanceof Element && event.target.closest(EDITING)) return;

      if (!isActivePanel(buttonRef.current)) return;
      event.preventDefault();
      expand();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expand, buttonRef]);
};

/** Renders record navigation, actions, and the guarded expansion shortcut. */
export const RecordSidePanelHeader = ({
  className,
  avatar,
  title,
  actions,
  onBack,
  onExpand,
  expanded: controlledExpanded,
  onClose,
}: RecordSidePanelHeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expansion = useContext(PanelExpansionContext);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const expand = onExpand ?? expansion?.toggle;
  const expanded = controlledExpanded ?? (!onExpand && expansion?.expanded);
  const expandLabel = expanded ? t('collapse', 'Collapse record') : t('expand', 'Expand record');

  useExpandShortcut(expand, expandButtonRef);

  return (
    // Lines up with a page's breadcrumb row: h-10 plus its 1px rule.
    <div
      className={cn(
        'box-content flex items-center gap-1 h-10 px-2 border-b bg-sidebar flex-none',
        className,
      )}
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 flex-none"
          onClick={onBack}
          title={t('back', 'Back')}
          aria-label={t('back', 'Back')}
        >
          <IconChevronLeft className="size-4" />
        </Button>
      )}
      {avatar}
      <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">{title}</div>
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
      {expand && (
        <Button
          ref={expandButtonRef}
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={expand}
          title={`${expandLabel} (Ctrl/⌘ + Shift + Enter)`}
          aria-label={expandLabel}
          aria-expanded={Boolean(expanded)}
          aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
        >
          {expanded ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
        </Button>
      )}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          title={t('close', 'Close')}
          aria-label={t('close', 'Close')}
        >
          <IconX className="size-4" />
        </Button>
      )}
    </div>
  );
};
