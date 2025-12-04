import { IPropertyType } from '@/properties/types/Properties';
import { Sidebar } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { CORE_FIELD_TYPES } from '../constants/coreFieldTypes';

export const PropertiesSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Property types</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {CORE_FIELD_TYPES.map((propertyType: IPropertyType) => (
              <Sidebar.MenuItem key={propertyType.contentType}>
                <PropertyTypeMenuItem propertyType={propertyType} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
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
  console.log(propertyType.contentType, type);
  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={`/settings/properties/${propertyType.contentType}`}>
        {propertyType.label}
      </Link>
    </Sidebar.MenuButton>
  );
};
