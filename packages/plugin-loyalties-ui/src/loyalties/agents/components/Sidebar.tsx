import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { PaddingTop } from '../../../styles';
import AgentFilter from './AgentFilter';

function Sidebar({ queryParams }: { queryParams: any; }) {
  return (
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <AgentFilter queryParams={queryParams}/>
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
