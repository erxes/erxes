import { IconCheck } from '@tabler/icons-react';
import { Button, cn, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationQuickRead } from '@/notification/hooks/useNotificationQuickRead';

export const NotificationQuickRead = ({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) => {
  const { pending, markRead } = useNotificationQuickRead(id);
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'pointer-events-none absolute right-2 bottom-2 size-6 bg-background text-muted-foreground opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
        pending && 'pointer-events-auto opacity-100',
      )}
      aria-label={t('mark-as-read')}
      title={t('mark-as-read')}
      disabled={disabled || pending}
      onClick={() => void markRead()}
    >
      {pending ? <Spinner containerClassName="size-4" /> : <IconCheck />}
    </Button>
  );
};
