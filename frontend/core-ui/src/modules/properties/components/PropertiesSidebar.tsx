import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { IPropertyType } from '@/properties/types/Properties';
import { Sidebar } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePropertyTypes } from '../hooks/usePropertyTypes';

export const PropertiesSidebar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { propertyTypes } = usePropertyTypes();
  const { pluginName: scopePluginName } = usePropertiesScope();
  // Inside a plugin's settings only that plugin's types are listed.
  const groups = Object.entries(propertyTypes).filter(
    ([pluginName]) => !scopePluginName || pluginName === scopePluginName,
  );

  return (
    <Sidebar.Panel
      className="border-r flex-none"
      label={tSidebar('properties')}
    >
      {groups.map(([pluginName, propertyTypes]) => (
        <Sidebar.Group key={pluginName}>
          <Sidebar.GroupLabel>
            {t(`plugin.${pluginName}`, `${pluginName} properties`)}
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {propertyTypes.map((propertyType) => (
                <Sidebar.MenuItem key={propertyType.contentType}>
                  <PropertyTypeMenuItem propertyType={propertyType} />
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar.Panel>
  );
};

const PropertyTypeMenuItem = ({
  propertyType,
}: {
  propertyType: IPropertyType;
}) => {
  const { basePath: propertiesBasePath } = usePropertiesScope();
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type } = useParams<{ type: string }>();
  const isActive = propertyType.contentType === type;
  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={`${propertiesBasePath}/${propertyType.contentType}`}>
        {t(
          `content-type.${propertyType.contentType.replace(':', '-')}`,
          propertyType.description,
        )}
      </Link>
    </Sidebar.MenuButton>
  );
};
