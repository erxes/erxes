import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader, adjustTypes } from './Header';
import { IconAdjustmentsCode } from '@tabler/icons-react';
import { Card } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const AdjustmentHome = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AdjustmentHeader />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-3">
        {adjustTypes.map((at) => (
          <Link key={at.value} to={`/accounting/adjustment/${at.value}`}>
            <Card className="h-full p-3 flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-accent">
              <IconAdjustmentsCode className="size-4 text-accent-foreground" />
              {t(at.label, { nsSeparator: false })}
            </Card>
          </Link>
        ))}
      </div>
    </AccountingLayout>
  );
};
