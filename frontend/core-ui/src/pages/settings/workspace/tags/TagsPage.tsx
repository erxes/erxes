import { TagAddButtons } from '@/settings/tags/components/TagAddButtons';
import { TagsBreadcrumb } from '@/settings/tags/components/TagsBreadcrumb';
import { TagsList } from '@/settings/tags/components/TagsList';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  Empty,
  PageContainer,
  PageSubHeader,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { IconTag } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { TagsSidebar } from '@/settings/tags/components/TagsSidebar';
import { useTranslation } from 'react-i18next';
import { SettingsHeader, TagTypeSelect } from 'ui-modules';

/** A plugin's tags page before its type is settled: wait, or say it has none. */
const PluginTagsPending = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

  if (loading) {
    return <Spinner containerClassName="flex-1" />;
  }

  return (
    <Empty className="m-3 flex-1">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconTag />
        </Empty.Media>
        <Empty.Title>{t('plugin-no-types')}</Empty.Title>
      </Empty.Header>
    </Empty>
  );
};

/**
 * Organization tags, or — with `pluginName` — a plugin's own settings page
 * listing only that plugin's tag types.
 */
export const TagsPage = ({ pluginName }: { pluginName?: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const { types, loading } = useTagTypes();
  const [type, setType] = useQueryState<string>('tagType');
  const pluginTypes = pluginName ? types[pluginName] || [] : [];
  const firstPluginType = pluginTypes[0]?.contentType;
  const isForeignType =
    Boolean(pluginName) &&
    !pluginTypes.some((pluginType) => pluginType.contentType === type);
  // Inside a plugin's settings nothing is queried or created for a type the
  // plugin does not own, whatever `tagType` the URL carries.
  const canShowTags = !isForeignType;

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
          {canShowTags && (
            <div className="ml-auto hidden md:block">
              <TagAddButtons />
            </div>
          )}
        </SettingsHeader>
        <PageSubHeader className="flex justify-between items-center overflow-x-auto md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t('type-label')}</span>
            <TagTypeSelect
              scope={SettingsHotKeyScope.TagsInput}
              pluginName={pluginName}
            />
          </div>
          {canShowTags && (
            <TagAddButtons className="md:hidden max-sm:flex-row-reverse" />
          )}
        </PageSubHeader>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {canShowTags ? (
            <TagsList />
          ) : (
            <PluginTagsPending loading={loading || Boolean(firstPluginType)} />
          )}
        </div>
      </div>
    </PageContainer>
  );
};
