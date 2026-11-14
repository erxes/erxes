import { ScrollArea } from 'erxes-ui';
import type { RefObject } from 'react';
import {
  ActivityLogs,
  AddInternalNote,
  type TRelationEntity,
} from 'ui-modules';
import { companyCustomActivities } from '@/contacts/companies/company-detail/CompanyActivityRows';
import { PluginRecordPanel } from '@/side-panel/components/PluginRecordPanel';

/** Keeps platform notes beside activity logs while plugins own their record activity. */
export const RecordPanelActivity = ({
  record,
  pluginName,
  noteRef,
}: {
  record: TRelationEntity;
  pluginName: string | null;
  noteRef: RefObject<HTMLDivElement>;
}) => {
  if (pluginName)
    return (
      <PluginRecordPanel
        pluginName={pluginName}
        contentType={record.contentType}
        contentId={record.contentId}
        view="activity"
      />
    );
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="pt-3 [&_.px-6]:px-2">
          <ActivityLogs
            targetId={record.contentId}
            customActivities={
              record.contentType === 'core:company'
                ? companyCustomActivities
                : undefined
            }
            variant="backward"
          />
        </div>
      </ScrollArea>
      <div
        ref={noteRef}
        className="shrink-0 pb-4 pt-2 [&_.ml-10]:ml-4 [&_.mr-8]:mr-4"
      >
        <AddInternalNote
          contentTypeId={record.contentId}
          contentType={record.contentType}
        />
      </div>
    </div>
  );
};
