import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules/modules/header/components/SettingsHeader';
import { TagAddButtons } from 'ui-modules/modules/tags-new/components/TagAddButtons';
import { TagsList } from 'ui-modules/modules/tags-new/components/TagsList';
import { TagTypeProvider } from 'ui-modules/modules/tags-new/hooks/useTagType';
import { TagsBreadcrumb } from 'ui-modules/modules/tags-new/components/TagsBreadcrumb';
export const TagsPageTemplate = ({
  type,
  title,
}: {
  type: string | null;
  title: string;
}) => {
  return (
    <TagTypeProvider value={type}>
      <PageContainer>
        <SettingsHeader breadcrumbs={<TagsBreadcrumb title={title} />}>
          <div className="ml-auto">
            <TagAddButtons />
          </div>
        </SettingsHeader>
        <div className="flex flex-auto overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden flex-1">
            {/* <PageSubHeader>
              <TagsSettingFilter />
            </PageSubHeader> */}
            <TagsList />
          </div>
        </div>
      </PageContainer>
    </TagTypeProvider>
  );
};
