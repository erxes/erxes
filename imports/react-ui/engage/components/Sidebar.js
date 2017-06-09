import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Main from './sidebar/Main';
import Status from './sidebar/Status';

function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <Main />
      <Status />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
