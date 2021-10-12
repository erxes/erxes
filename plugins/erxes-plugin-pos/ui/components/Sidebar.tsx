import { Wrapper } from 'erxes-ui';
import React from 'react';
import PosList from '../containers/Pos/PosList';

function Sidebar({ history, queryParams }: { history: any; queryParams: any }) {
  return (
    <Wrapper.Sidebar>
      <PosList queryParams={queryParams} history={history} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
