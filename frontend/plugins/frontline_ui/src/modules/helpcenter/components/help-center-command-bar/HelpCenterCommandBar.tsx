import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IHelpCenter } from '@/helpcenter/types';
import { HelpCenterDelete } from './HelpCenterDelete';

export const HelpCenterCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const helpCenterIds = selectedRows.map(
    (row) => (row.original as IHelpCenter)._id,
  );

  return (
    <CommandBar open={helpCenterIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: helpCenterIds.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <HelpCenterDelete helpCenterIds={helpCenterIds} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
