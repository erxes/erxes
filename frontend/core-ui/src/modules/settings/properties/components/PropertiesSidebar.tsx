import { IPropertyType } from '@/settings/properties/types';
import { Sidebar, Skeleton, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const PropertiesSidebar = () => {
  const [loading] = useState<boolean>(false);
  const [fieldsGetTypes] = useState<IPropertyType[]>([
    { description: 'Conversation details', contentType: 'inbox:conversation' },
    { description: 'Facebook Messages', contentType: 'facebook:messages' },
  ]);

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Property types</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {fieldsGetTypes &&
              fieldsGetTypes.map((propertyType: IPropertyType) => (
                <Sidebar.MenuItem key={propertyType.contentType}>
                  <PropertyTypeMenuItem propertyType={propertyType} />
                </Sidebar.MenuItem>
              ))}
            {loading &&
              Array.from({ length: 10 }).map((_, index) => (
                <Sidebar.MenuItem key={index}>
                  <Skeleton className="w-full h-4 my-1" />
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
  const [type] = useQueryState<string>('type');
  const isActive = propertyType.contentType === type;
  return (
    <Link to={`/settings/properties?type=${propertyType.contentType}`}>
      <Sidebar.MenuButton isActive={isActive}>
        {propertyType.description}
      </Sidebar.MenuButton>
    </Link>
  );
};
