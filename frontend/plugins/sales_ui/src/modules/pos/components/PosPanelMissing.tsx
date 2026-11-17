import { Button, Spinner } from 'erxes-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const PosPanelMissing = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslation('sales');

  return (
    <div className="space-y-3 p-4 text-sm">
      <p className="text-muted-foreground">
        {t('pos-panel-missing', 'Open this form again from the POS settings.')}
      </p>
      <Button variant="secondary" size="sm" onClick={onCancel}>
        {t('cancel')}
      </Button>
    </div>
  );
};

const PosPanelError = ({ message }: { message: string }) => {
  const { t } = useTranslation('sales');

  return (
    <p className="p-4 text-sm text-destructive">
      {t('failed-to-load-pos-details', { message })}
    </p>
  );
};

export const renderPosPanelStatus = ({
  missing,
  loading,
  error,
  onCancel,
}: {
  missing: boolean;
  loading: boolean;
  error?: Error;
  onCancel: () => void;
}): ReactNode | null => {
  if (missing) {
    return <PosPanelMissing onCancel={onCancel} />;
  }

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error) {
    return <PosPanelError message={error.message} />;
  }

  return null;
};
