import { ExportHistories } from '@/import-export/export/components/ExportHistories';
import { ScrollArea } from 'erxes-ui';

export const ExportHistoriesSettingsPage = () => {
  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="min-w-0 w-full px-6 py-5">
          <ExportHistories />
        </div>
      </ScrollArea>
    </div>
  );
};
