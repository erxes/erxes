import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CmsSavedRowLoadError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('content');

  return (
    <div role="alert" className="space-y-2 text-sm">
      <p>
        {t('cms-saved-row-load-error', {
          defaultValue:
            'Could not load saved translations. Saving is off so they are not overwritten.',
        })}
      </p>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        onClick={onRetry}
      >
        {t('retry', { defaultValue: 'Retry' })}
      </Button>
    </div>
  );
};
