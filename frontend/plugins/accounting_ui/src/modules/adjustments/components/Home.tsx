import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader, adjustTypes } from './Header';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const AdjustmentHome = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AdjustmentHeader />

      {adjustTypes.map((at) => (
        <Link to={`/accounting/adjustment/${at.value}`}>
          <div>{t(at.label)}</div>
        </Link>
      ))}
    </AccountingLayout>
  );
};
