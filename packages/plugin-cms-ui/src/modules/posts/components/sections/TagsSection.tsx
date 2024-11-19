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

const TagSection = (props: Props) => {
  return (
    <Box title={__('Tag')} name='tags' isOpen={true}>
      <Sidebar.Section>
        <>tags render here</>
      </Sidebar.Section>
    </Box>
  )
}

export default TagSection