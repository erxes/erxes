import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useImportHistoriesRecordTable } from './ImportHistoriesContext';

export const ImportHistoriesErrorState = () => {
  const { columnsLength } = useImportHistoriesRecordTable();
  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[22rem] border border-destructive/30 bg-destructive/5">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconAlertCircle className="text-destructive" />
            </Empty.Media>
            <Empty.Title>Import history couldn&apos;t be loaded</Empty.Title>
            <Empty.Description>
              Try refreshing this page again in a moment.
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </td>
    </tr>
  );
};
