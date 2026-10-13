import { IconLifebuoy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useHelpCenterColumns } from '@/helpcenter/components/HelpCenterColumns';
import { HelpCenterCommandBar } from '@/helpcenter/components/help-center-command-bar';
import { HELP_CENTER_TABLE_ID } from '@/helpcenter/constants';
import { useHelpCenters } from '@/helpcenter/hooks/useHelpCenters';
import { KbRecordTable } from '@/knowledgebase/shared/components/KbRecordTable';
import { KbEmptyState } from '@/knowledgebase/shared/components/KbStates';

export const HelpCenterRecordTable = ({
  onCreate,
}: {
  onCreate: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { helpCenters, loading, error } = useHelpCenters();
  const columns = useHelpCenterColumns();

  return (
    <KbRecordTable
      columns={columns}
      data={helpCenters || []}
      loading={loading}
      error={error}
      tableId={HELP_CENTER_TABLE_ID}
      empty={
        <KbEmptyState
          icon={IconLifebuoy}
          title={t('helpcenter-none-yet', 'There are no help centers yet')}
          description={t(
            'helpcenter-none-description',
            'Create your first help center to publish your knowledge base.',
          )}
          action={
            <Button variant="outline" onClick={onCreate}>
              {t('helpcenter-create', 'Create Help Center')}
            </Button>
          }
        />
      }
      commandBar={<HelpCenterCommandBar />}
    />
  );
};
