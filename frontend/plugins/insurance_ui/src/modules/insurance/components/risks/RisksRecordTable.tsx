import { IconAlertTriangle } from '@tabler/icons-react';
import { risksColumns } from './RisksColumns';
import { useRiskTypes } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';

export const RisksRecordTable = () => {
  const { riskTypes, loading } = useRiskTypes();

  return (
    <GenericRecordTable
      columns={risksColumns}
      data={riskTypes || []}
      loading={loading}
      sessionKey="risks-cursor"
      stickyColumns={['more', 'checkbox', 'name']}
      emptyState={{
        icon: <IconAlertTriangle size={64} />,
        title: 'No risk types yet',
        description:
          'Define risk types that can be covered by insurance products.',
      }}
    />
  );
};
