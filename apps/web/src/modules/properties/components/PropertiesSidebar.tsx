import { isCoreFieldType, type PropertyContentType } from '@erxes/core-contract';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { propertyPaths } from '~/lib/paths';
import { pluginName, usePluginText } from '~/modules/plugins/pluginText';
import { usePropertyTypeLabel } from '../usePropertyTypeLabel';

/** Who keeps a record type: core, or the plugin it starts with (`operation.task`). */
const ownerOf = (type: PropertyContentType) =>
  isCoreFieldType(type) ? null : (type.split('.')[0] ?? null);

/** The "Properties" panel listing the record types that have properties, a group per owner. */
export const PropertiesSidebar = ({ types }: { types: readonly PropertyContentType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { type } = useParams<{ type: string }>();
  const typeLabel = usePropertyTypeLabel();
  const text = usePluginText();
  const owners = [...new Set(types.map(ownerOf))];

  return (
    <Sidebar.Panel className="flex-none" label={tSidebar('properties', 'Properties')}>
      {owners.map((owner) => (
        <Sidebar.Group key={owner ?? 'core'}>
          <Sidebar.GroupLabel>
            {owner ? pluginName(text, owner) : t('plugin.core', 'core properties')}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {types
                .filter((contentType) => ownerOf(contentType) === owner)
                .map((contentType) => (
                  <Sidebar.MenuItem key={contentType}>
                    <Sidebar.MenuButton
                      isActive={contentType === type}
                      render={<Link to={propertyPaths(contentType).list} />}
                    >
                      {typeLabel(contentType)}
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
