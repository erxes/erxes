import { PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { TagsSettingBreadcrumb } from '@/settings/tags/components/TagsSettingBreadcrumb';
import { TagsSettingFilter } from '@/settings/tags/components/TagsSettingsFilter';
import { TagsGroupsAddButtons } from '@/settings/tags/components/TagsGroupsAddButtons';
import { TagsEditDialog } from '@/settings/tags/components/TagsEditDialog';
import { TagProvider } from '@/settings/tags/providers/TagProvider';
import { TagsList } from '@/settings/tags/new/TagsList';
export const TagsPage = () => {
  const [tagId] = useQueryState('tagId');
  return (
    <PageContainer>
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
            <TagsList type={null} />
          </div>
        </div>
      </TagProvider>
      {!!tagId && <TagsEditDialog />}
    </PageContainer>
  );
};
