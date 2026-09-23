import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TopicsDelete } from '@/knowledgebase/topics/components/topics-command-bar/TopicsDelete';
import { ITopic } from '@/knowledgebase/types';

export const TopicsCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const topicIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => (row.original as ITopic)._id);

  return (
    <CommandBar open={topicIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: topicIds.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <TopicsDelete topicIds={topicIds} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
