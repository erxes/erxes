import { IPropertyType } from '@/properties/types/Properties';
import { Sidebar } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { usePropertyTypes } from '../hooks/usePropertyTypes';

export const PropertiesSidebar = () => {
  const { propertyTypes } = usePropertyTypes();

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      {Object.entries(propertyTypes).map(([pluginName, propertyTypes]) => (
        <Sidebar.Group key={pluginName}>
          <Sidebar.GroupLabel className="mb-1">{`${pluginName} properties`}</Sidebar.GroupLabel>
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
    </Sidebar>
  );
};

const PropertyTypeMenuItem = ({
  propertyType,
}: {
  propertyType: IPropertyType;
}) => {
  const { type } = useParams<{ type: string }>();
  const isActive = propertyType.contentType === type;
  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={`/settings/properties/${propertyType.contentType}`}>
        {propertyType.description}
      </Link>
    </Sidebar.MenuButton>
  );
};
