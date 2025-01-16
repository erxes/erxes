import { __, Sidebar, SidebarList } from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import React from 'react';
import SelectTag from '../../../tags/containers/SelectTag';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const TagSection = (props: Props) => {
  const { Section } = Sidebar;
  return (
    <Box title={__('Tag')} name='tags' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <li>
              <div style={{ width: '100%', zIndex: 9999 }}>
                <SelectTag
                  clientPortalId={props.clientPortalId}
                  onChange={(tagIds) => props.onChange('tagIds', tagIds)}
                  value={props.post.tagIds}
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

export default TagSection;
