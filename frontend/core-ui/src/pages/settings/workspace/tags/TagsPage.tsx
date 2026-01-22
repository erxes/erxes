import { TagAddButtons } from '@/settings/tags/components/TagAddButtons';
import { TagsBreadcrumb } from '@/settings/tags/components/TagsBreadcrumb';
import { TagsList } from '@/settings/tags/components/TagsList';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { SettingsHeader, TagTypeSelect } from 'ui-modules';

export const TagsPage = () => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<TagsBreadcrumb />}>
        <div className="ml-auto hidden md:block">
          <TagAddButtons />
        </div>
      </SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-1">
          <PageSubHeader className="flex justify-between items-center overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <TagTypeSelect scope={SettingsHotKeyScope.TagsInput} />
            </div>
            <TagAddButtons className="md:hidden max-sm:flex-row-reverse" />
          </PageSubHeader>
          <TagsList />
        </div>
      </div>
    </PageContainer>
  );
};
