import { IconCashRegister, IconSettings } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PosEmptyStateProps {
  isCreate?: boolean;
  onCreatePos?: () => void;
}

export const PosEmptyState = ({
  isCreate,
  onCreatePos,
}: PosEmptyStateProps) => {
  const { t } = useTranslation('sales');
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconCashRegister
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-pos-yet')}
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        {t('create-pos-description')}
      </p>
      {isCreate ? (
        <Button variant="default" onClick={onCreatePos}>
          {t('pos-create')}
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link to="/settings/sales/pos">
            <IconSettings />
            {t('go-to-settings')}
          </Link>
        </Button>
      )}
    </div>
  );
};
