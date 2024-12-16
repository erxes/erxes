import React from 'react';
import Box from '@erxes/ui/src/components/Box';
import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src';
import SelectCategory from '../../../categories/containers/SelectCategory';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const CategorySection = (props: Props) => {
  const { Section } = Sidebar;
  
  return (
    <Box title={__('Category')} name='category' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <li>
            <div style={{ width: '100%', zIndex: 9999 }}>
              <SelectCategory
                clientPortalId={props.clientPortalId}
                onChange={(catIds) => props.onChange('categoryIds', catIds)}
                value={props.post.categoryIds}
                isMulti={true}
              />
            </div>
            </li>
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Box>
  );
};

export default CategorySection;
