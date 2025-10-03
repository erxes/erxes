import { PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { TagsSettingBreadcrumb } from '@/settings/tags/components/TagsSettingBreadcrumb';
import { TagsSidebar } from '@/settings/tags/components/TagsSidebar';
import { TagsRecordTable } from '@/settings/tags/components/TagsRecordTable';
import { TagsSettingFilter } from '@/settings/tags/components/TagsSettingsFilter';
import { TagsAddDialog } from '@/settings/tags/components/TagsAddDialog';
import { TagsEditDialog } from '@/settings/tags/components/TagsEditDialog';

export const TagsSettingPage = () => {
  const [tagId] = useQueryState('tagId');
  return (
    <PageContainer title="Tags">
      <SettingsHeader breadcrumbs={<TagsSettingBreadcrumb />}>
        <div className="ml-auto">
          <TagsAddDialog />
        </div>
      </SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <TagsSidebar />
        <div className="flex flex-col h-full overflow-hidden flex-1">
          <PageSubHeader>
            <TagsSettingFilter />
          </PageSubHeader>
          <TagsRecordTable />
        </div>
      </div>
      {!!tagId && <TagsEditDialog />}
    </PageContainer>
  );
};
