import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const WhatsappListError = ({
  title,
  error,
  onRetry,
  className,
}: {
  title: string;
  error: Error;
  onRetry: () => void;
  className?: string;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-6 text-center',
        className,
      )}
    >
      <div className="text-sm font-medium text-destructive">{title}</div>
      <div className="text-sm text-muted-foreground">{error.message}</div>
      <Button type="button" variant="secondary" onClick={onRetry}>
        {t('retry', 'Retry')}
      </Button>
    </div>
  );
};
