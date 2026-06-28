import { IconAlertTriangle } from '@tabler/icons-react';
import { risksColumns } from './RisksColumns';
import { useRiskTypes } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const RisksRecordTable = () => {
  const { t } = useTranslation('insurance');
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
        title: t('no-risk-types-yet'),
        description: t('no-risk-types-description'),
      }}
    />
  );
};
