import { IconFileX } from '@tabler/icons-react';
import { contractsColumns } from './ContractsColumns';
import { useContracts } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const ContractsRecordTable = () => {
  const { t } = useTranslation('insurance');
  const { contracts, loading } = useContracts();

  return (
    <GenericRecordTable
      columns={contractsColumns}
      data={contracts || []}
      loading={loading}
      sessionKey="contracts-cursor"
      stickyColumns={['more', 'checkbox', 'contractNumber']}
      emptyState={{
        icon: <IconFileX size={64} />,
        title: t('no-contracts-yet'),
        description: t('no-contracts-description'),
      }}
    />
  );
};
