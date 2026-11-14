import type { FieldContentType } from '@erxes/core-contract';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PROPERTY_TYPES, propertiesPath } from '../constants';

/** The "Properties" panel listing the record types that have properties. */
export const PropertiesSidebar = ({ types }: { types: readonly FieldContentType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { type } = useParams<{ type: string }>();

  return (
    <Sidebar.Panel className="border-r flex-none" label={tSidebar('properties', 'Properties')}>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('plugin.core', 'core properties')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {types.map((contentType) => (
              <Sidebar.MenuItem key={contentType}>
                <Sidebar.MenuButton
                  isActive={contentType === type}
                  render={<Link to={propertiesPath(contentType)} />}
                >
                  {t(
                    `content-type.${PROPERTY_TYPES[contentType].i18nKey}`,
                    PROPERTY_TYPES[contentType].label,
                  )}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
};
