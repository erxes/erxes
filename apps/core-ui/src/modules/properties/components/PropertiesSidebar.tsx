import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PROPERTIES_BASE_PATH, PROPERTY_TYPES } from '../constants';

/** The "Properties" panel listing the record types that have properties. */
export const PropertiesSidebar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { type } = useParams<{ type: string }>();

  return (
    <Sidebar.Panel className="border-r flex-none" label={tSidebar('properties', 'Properties')}>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('plugin.core', 'core properties')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {PROPERTY_TYPES.map((propertyType) => (
              <Sidebar.MenuItem key={propertyType.contentType}>
                <Sidebar.MenuButton isActive={propertyType.contentType === type} asChild>
                  <Link to={`${PROPERTIES_BASE_PATH}/${propertyType.contentType}`}>
                    {t(`content-type.${propertyType.i18nKey}`, propertyType.description)}
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
};
