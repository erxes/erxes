import React from 'react';
import { Box, SidebarList, FieldStyle } from '@erxes/ui/src';

const Sidebar = () => {
  return (
    <Box name="Sidebar name" title="Sidebar title">
      <SidebarList>
        <li>
          <a href="#">
            <FieldStyle>Sidebar box content</FieldStyle>
          </a>
        </li>
      </SidebarList>
    </Box>
  );
};

export default Sidebar;
