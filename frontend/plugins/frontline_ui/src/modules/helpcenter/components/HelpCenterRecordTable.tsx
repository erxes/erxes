import { IconAlertCircle, IconLifebuoy } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useHelpCenterColumns } from '@/helpcenter/components/HelpCenterColumns';
import { HelpCenterCommandBar } from '@/helpcenter/components/help-center-command-bar';
import { HELP_CENTER_TABLE_ID } from '@/helpcenter/constants';
import { useHelpCenters } from '@/helpcenter/hooks/useHelpCenters';

export const HelpCenterRecordTable = ({
  onCreate,
}: {
  onCreate: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { helpCenters, loading, error } = useHelpCenters();
  const columns = useHelpCenterColumns();

  if (error) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  if (!loading && helpCenters?.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconLifebuoy />
          </Empty.Media>
          <Empty.Title>{t('kb-no-topics-yet')}</Empty.Title>
          <Empty.Description>{t('kb-no-topics-description')}</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" onClick={onCreate}>
            {t('kb-create-topic')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={helpCenters || []}
      stickyColumns={['more', 'checkbox', 'title']}
      className="m-3"
      tableId={HELP_CENTER_TABLE_ID}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={10} />
            ) : (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <HelpCenterCommandBar />
    </RecordTable.Provider>
  );
};
