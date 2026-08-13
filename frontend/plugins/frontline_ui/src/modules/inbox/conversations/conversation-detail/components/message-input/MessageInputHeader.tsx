import { IconMessage2, IconNote } from '@tabler/icons-react';
import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface MessageInputHeaderProps {
  internalNoteLabel: string;
  isInternalNote: boolean;
}

export const MessageInputHeader = ({
  internalNoteLabel,
  isInternalNote,
}: MessageInputHeaderProps) => {
  const { t } = useTranslation('frontline');
  const modeLabel = isInternalNote ? internalNoteLabel : t('reply');

  return (
    <div className="flex items-center gap-3 border-b px-4 py-2.5">
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary',
          isInternalNote && 'bg-warning/15 text-warning',
        )}
      >
        {isInternalNote ? (
          <IconNote className="size-4" />
        ) : (
          <IconMessage2 className="size-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{modeLabel}</p>
        <p className="text-xs text-muted-foreground">
          {isInternalNote ? t('private') : t('customer')}
        </p>
      </div>
      <Badge
        variant={isInternalNote ? 'warning' : 'default'}
        className="ml-auto"
      >
        {modeLabel}
      </Badge>
    </div>
  );
};
