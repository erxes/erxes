import { IconChevronLeft, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'erxes-ui';
import { PanelExpandButton } from './PanelExpandButton';
import type { RecordSidePanelHeaderProps } from './recordSidePanelTypes';

/** Renders record navigation, actions, and the button switching to the record's own page. */
export const RecordSidePanelHeader = ({
  className,
  variant = 'panel',
  avatar,
  title,
  heading = true,
  actions,
  onBack,
  onExpand,
  expanded,
  onClose,
}: RecordSidePanelHeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    // Lines up with a page's breadcrumb row: h-10 plus its 1px rule.
    <div
      className={cn(
        'box-content flex items-center gap-1 h-10 border-b flex-none',
        variant === 'page' ? 'px-3 bg-background' : 'px-2 bg-sidebar',
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
      {/* The record's name heads the panel; controls (the assistant's tabs) or nothing yet don't. */}
      {heading && title ? (
        <h2 className="flex-1 min-w-0 px-1 text-sm font-medium truncate">{title}</h2>
      ) : (
        <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">{title}</div>
      )}
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
      <PanelExpandButton onExpand={onExpand} expanded={expanded} />
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
