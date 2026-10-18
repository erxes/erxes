import { TagAddButtons } from '@/settings/tags/components/TagAddButtons';
import { TagsBreadcrumb } from '@/settings/tags/components/TagsBreadcrumb';
import { TagsList } from '@/settings/tags/components/TagsList';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { TagsSidebar } from '@/settings/tags/components/TagsSidebar';
import { useTranslation } from 'react-i18next';
import { SettingsHeader, TagTypeSelect } from 'ui-modules';

/**
 * Organization tags, or — with `pluginName` — a plugin's own settings page
 * listing only that plugin's tag types.
 */
export const TagsPage = ({ pluginName }: { pluginName?: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const { types } = useTagTypes();
  const [type, setType] = useQueryState<string>('tagType');
  const pluginTypes = pluginName ? types[pluginName] || [] : [];
  const firstPluginType = pluginTypes[0]?.contentType;
  const isForeignType =
    Boolean(pluginName) &&
    !pluginTypes.some((pluginType) => pluginType.contentType === type);

  // A plugin has no workspace (untyped) tags: open its first tag type.
  useEffect(() => {
    if (isForeignType && firstPluginType) {
      setType(firstPluginType);
    }
  }, [firstPluginType, isForeignType, setType]);

  return (
    <PageContainer className="flex-row">
      <TagsSidebar className="max-md:hidden" pluginName={pluginName} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SettingsHeader breadcrumbs={<TagsBreadcrumb />}>
          <div className="ml-auto hidden md:block">
            <TagAddButtons />
          </div>
        </SettingsHeader>
        <PageSubHeader className="flex justify-between items-center overflow-x-auto md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('type-label')}</span>
            <TagTypeSelect
              scope={SettingsHotKeyScope.TagsInput}
              pluginName={pluginName}
            />
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
