import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const WidgetQueryError = ({
  error,
  onRetry,
  disabled,
}: {
  error: Error;
  onRetry: () => Promise<unknown>;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('operation');
  return (
    <div className="p-4 space-y-2 text-sm" role="alert">
      <p>{error.message}</p>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => void onRetry().catch(() => undefined)}
      >
        {t('retry', { defaultValue: 'Retry' })}
      </Button>
    </div>
  );
};
