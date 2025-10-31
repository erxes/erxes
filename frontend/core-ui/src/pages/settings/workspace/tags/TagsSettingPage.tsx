import { PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { TagsSettingBreadcrumb } from '@/settings/tags/components/TagsSettingBreadcrumb';
import { TagsRecordTable } from '@/settings/tags/components/TagsRecordTable';
import { TagsSettingFilter } from '@/settings/tags/components/TagsSettingsFilter';
import { TagsGroupsAddButtons } from '@/settings/tags/components/TagsGroupsAddButtons';
import { TagsEditDialog } from '@/settings/tags/components/TagsEditDialog';
import { TagProvider } from '@/settings/tags/providers/TagProvider';

export const TagsSettingPage = () => {
  const [tagId] = useQueryState('tagId');
  return (
    <PageContainer title="Tags">
      <TagProvider>
        <SettingsHeader breadcrumbs={<TagsSettingBreadcrumb />}>
          <div className="ml-auto">
            <TagsGroupsAddButtons />
          </div>
        </SettingsHeader>
        <div className="flex flex-auto overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden flex-1">
            <PageSubHeader>
              <TagsSettingFilter />
            </PageSubHeader>
            <TagsRecordTable />
          </div>
        </div>
      </TagProvider>
      {!!tagId && <TagsEditDialog />}
    </PageContainer>
  );
};
