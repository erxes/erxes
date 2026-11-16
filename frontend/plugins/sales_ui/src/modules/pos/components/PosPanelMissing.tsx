import { Button } from 'erxes-ui';
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
