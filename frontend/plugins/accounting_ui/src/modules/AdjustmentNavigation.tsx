import { IconAdjustmentsCode } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NavigationSection } from './NavigationSection';

export const AdjustmentNavigation = () => {
  const { t } = useTranslation('accounting');

  return (
    <NavigationSection
      name={t('adjustment-settings')}
      icon={IconAdjustmentsCode}
      sectionPath="/accounting/adjustment"
      items={[
        {
          name: t('fund-rate-adjustment'),
          icon: IconAdjustmentsCode,
          path: 'accounting/adjustment/fundRate',
        },
        {
          name: t('debt-rate-adjustment'),
          icon: IconAdjustmentsCode,
          path: 'accounting/adjustment/debRate',
        },
        {
          name: t('inventory-cost-calc'),
          icon: IconAdjustmentsCode,
          path: 'accounting/adjustment/inventory',
        },
        {
          name: t('fixed-asset'),
          icon: IconAdjustmentsCode,
          path: 'accounting/adjustment/fxa',
        },
        {
          name: t('closing-entry'),
          icon: IconAdjustmentsCode,
          path: 'accounting/adjustment/closing',
        },
      ]}
    />
  );
};
