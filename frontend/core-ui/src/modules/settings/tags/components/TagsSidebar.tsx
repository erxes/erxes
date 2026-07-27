import { cn, Sidebar, useQueryState } from 'erxes-ui';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { useTranslation } from 'react-i18next';

export const TagsSidebar = ({ className }: { className?: string }) => {
  const { types } = useTagTypes();
  const [type, setType] = useQueryState<string>('tagType');
  const { t } = useTranslation('settings');

  return (
    <Sidebar collapsible="none" className={cn('border-r flex-none', className)}>
      {Object.entries(types).map(([key, value]) => (
        <Sidebar.Group key={key}>
          <Sidebar.GroupLabel>
            {key === 'core' ? t('tags.core-tags', 'Core tags') : `${key} ${t('tags.tags-suffix', 'tags')}`}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {key === 'core' && (
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton
                    isActive={type === null}
                    onClick={() => setType(null)}
                  >
                    {t('tags.workspace-tags', 'Workspace tags')}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              )}
              {value.map((_type) => (
                <Sidebar.MenuItem key={_type.contentType}>
                  <Sidebar.MenuButton
                    isActive={type === _type.contentType}
                    onClick={() => setType(_type.contentType)}
                  >
                    {_type.description} {t('tags.tags-suffix', 'tags')}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar>
  );
};
