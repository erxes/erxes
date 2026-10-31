import { Sidebar, cn, useQueryState } from 'erxes-ui';

import { SETTINGS_INLINE_TYPES_LIMIT } from '@/settings/constants/data';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { useTranslation } from 'react-i18next';

export const TagsSidebar = ({
  className,
  pluginName,
}: {
  className?: string;
  pluginName?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { types } = useTagTypes();
  const [type, setType] = useQueryState<string>('tagType');

  if (
    pluginName &&
    (types[pluginName]?.length ?? 0) <= SETTINGS_INLINE_TYPES_LIMIT
  ) {
    return null;
  }

  return (
    <Sidebar.Panel
      className={cn('border-r flex-none', className)}
      label={tSidebar('tags')}
    >
      {Object.entries(types)
        .filter(([key]) => !pluginName || key === pluginName)
        .map(([key, value]) => (
          <Sidebar.Group key={key}>
            <Sidebar.GroupLabel>
              {key === 'core' ? t('core-tags') : t('type-tags', { type: key })}
            </Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {key === 'core' && (
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton
                      isActive={type === null}
                      onClick={() => setType(null)}
                    >
                      {t('workspace-tags')}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                )}
                {value.map((_type) => (
                  <Sidebar.MenuItem key={_type.contentType}>
                    <Sidebar.MenuButton
                      isActive={type === _type.contentType}
                      onClick={() => setType(_type.contentType)}
                    >
                      {t('type-tags', {
                        type: _type.description,
                      })}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                ))}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        ))}
    </Sidebar.Panel>
  );
};
