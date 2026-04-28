import { TagsBreadcrumb } from '@/settings/tags/components/TagsBreadcrumb';
import { TagsTreeTable } from '@/settings/tags/components/TagsTreeTable';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { TagsSidebar } from '@/settings/tags/components/TagsSidebar';
import { SettingsHeader, TagTypeSelect } from 'ui-modules';

export const TagsPage = () => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<TagsBreadcrumb />} />
      <div className="flex flex-col h-full">
        <PageSubHeader className="flex justify-between items-center overflow-x-auto md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium">Type:</span>
            <TagTypeSelect scope={SettingsHotKeyScope.TagsInput} />
          </div>
        </PageSubHeader>
        <div className="flex h-full overflow-hidden flex-1">
          <TagsSidebar className="max-md:hidden" />
          <TagsTreeTable />
        </div>
      </div>
    </PageContainer>
  );
};
