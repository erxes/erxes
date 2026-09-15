import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ViberSendRecovery = ({
  loading,
  onRecover,
}: {
  loading: boolean;
  onRecover: () => Promise<void>;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div role="status" className="space-y-2 text-sm">
      <p>
        {t('viber-recover-help', {
          defaultValue:
            'The last send could not be confirmed. Check the original message to continue; your draft is preserved.',
        })}
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={loading}
        onClick={() => void onRecover()}
      >
        {loading && <Spinner size="sm" />}
        {t('viber-recover-send', { defaultValue: 'Check original message' })}
      </Button>
    </div>
  );
};
