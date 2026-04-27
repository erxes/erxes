import { ImportHistories } from '@/import-export/import/components/ImportHistories';
import { ScrollArea } from 'erxes-ui';

export const ImportHistoriesSettingsPage = () => {
  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="min-w-0 w-full px-6 py-5">
          <ImportHistories />
        </div>
      </ScrollArea>
    </div>
  );
};
