import { ScrollArea, Tabs, useQueryState } from 'erxes-ui';
import { MemberGeneral } from './MemberGeneral';
import { MemberLinks } from './MemberLinks';
import { ActivityLogs, FieldsInDetail } from 'ui-modules';
import { useUserDetail } from '../../hooks/useUserDetail';
import { useUserCustomFieldEdit } from '../../hooks/useUserEdit';

export const MemberDetailMainContents = () => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { userDetail } = useUserDetail();

  return (
    <Tabs
      className="flex-auto overflow-hidden"
      value={selectedTab ?? 'overview'}
      onValueChange={setSelectedTab}
    >
      <ScrollArea className="h-full">
        <Tabs.Content value="overview">
          <MemberGeneral />
        </Tabs.Content>
        <Tabs.Content value="links">
          <MemberLinks />
        </Tabs.Content>
        <Tabs.Content value="properties">
          <FieldsInDetail
            fieldContentType="core:user"
            propertiesData={userDetail?.propertiesData || {}}
            mutateHook={useUserCustomFieldEdit}
            id={userDetail?._id || ''}
            className="p-6"
          />
        </Tabs.Content>
        <Tabs.Content value="activity">
          <ActivityLogs targetId={userDetail?._id || ''} />
        </Tabs.Content>
      </ScrollArea>
    </Tabs>
  );
};
