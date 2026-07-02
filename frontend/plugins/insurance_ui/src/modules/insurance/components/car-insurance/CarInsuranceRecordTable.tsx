import { IconFileX } from '@tabler/icons-react';
import { carInsuranceColumns } from './CarInsuranceColumns';
import { useContracts } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const CarInsuranceRecordTable = () => {
  const { t } = useTranslation('insurance');
  const { contracts, loading } = useContracts();

  return (
    <GenericRecordTable
      columns={carInsuranceColumns}
      data={contracts || []}
      loading={loading}
      sessionKey="car-insurance-cursor"
      stickyColumns={['more', 'checkbox', 'contractNumber']}
      emptyState={{
        icon: <IconFileX size={64} />,
        title: t('no-contracts-yet'),
        description: t('no-car-insurance-contracts-description'),
      }}
    />
  );
};
