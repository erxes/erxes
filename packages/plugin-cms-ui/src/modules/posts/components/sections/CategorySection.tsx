import React from 'react'
import Box from '@erxes/ui/src/components/Box';
import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src';

type Props = {
    post: any;
    onChange: (field: string, value: any) => void;
}

const CategorySection = (props: Props) => {
  return (
    <Box title={__('Category')} name='category' isOpen={true}>
      <Sidebar.Section>
        <>categories render here</>
      </Sidebar.Section>
    </Box>
  )
}

export default CategorySection