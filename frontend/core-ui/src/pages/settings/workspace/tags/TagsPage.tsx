import { TagAddButtons } from '@/settings/tags/components/TagAddButtons';
import { TagsBreadcrumb } from '@/settings/tags/components/TagsBreadcrumb';
import { TagsList } from '@/settings/tags/components/TagsList';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { TagsSidebar } from '@/settings/tags/components/TagsSidebar';
import { useTranslation } from 'react-i18next';
import { SettingsHeader, TagTypeSelect } from 'ui-modules';

export const TagsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  return (
    <PageContainer className="flex-row">
      <TagsSidebar className="max-md:hidden" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SettingsHeader breadcrumbs={<TagsBreadcrumb />}>
          <div className="ml-auto hidden md:block">
            <TagAddButtons />
          </div>
        </SettingsHeader>
        <PageSubHeader className="flex justify-between items-center overflow-x-auto md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('type-label')}</span>
            <TagTypeSelect scope={SettingsHotKeyScope.TagsInput} />
          </div>
          <TagAddButtons className="md:hidden max-sm:flex-row-reverse" />
        </PageSubHeader>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <TagsList />
        </div>
      </div>
    </PageContainer>
  );
};
