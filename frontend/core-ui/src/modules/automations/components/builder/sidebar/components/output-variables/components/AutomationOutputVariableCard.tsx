import { useAutomationOutputVariableCard } from '../hooks/useAutomationOutputVariableCard';
import { IconCheck, IconCopy, IconLink } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationOutputVariableCard = ({
  title,
  path,
  token,
  badge,
  onClick,
  onInsertLink,
  onDragStart,
}: {
  title: string;
  path: string;
  token: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  onInsertLink?: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    copied,
    isClickable,
    role,
    tabIndex,
    handleKeyDown,
    copyToken,
    insertLink,
  } = useAutomationOutputVariableCard({ token, onClick, onInsertLink });

  return (
    <div
      className={cn(
        'group rounded-md border bg-background px-3 py-2 active:cursor-grabbing',
        isClickable ? 'cursor-pointer hover:border-primary/60' : 'cursor-grab',
      )}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={tabIndex}
      title={token}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-foreground">{title}</div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              'size-6 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
              copied ? 'opacity-100' : 'opacity-0',
            )}
            title={t('copy-variable')}
            aria-label={t('copy-variable')}
            onClick={copyToken}
          >
            {copied ? (
              <IconCheck className="size-3.5 text-success" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </Button>
          {onInsertLink ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-6"
              title={t('insert-as-link')}
              onClick={insertLink}
            >
              <IconLink className="size-3.5" />
            </Button>
          ) : null}
          {badge}
        </div>
      </div>
      <div className="mt-1 max-w-full truncate font-mono text-xs text-muted-foreground">
        {path}
      </div>
    </div>
  );
};
