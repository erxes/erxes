import { Wrapper } from 'erxes-ui';
import React from 'react';
import PosList from '../containers/Pos/PosList';
import { IPos } from '../types';

function Sidebar({
  history,
  queryParams,
  onChangePos
}: {
  history: any;
  queryParams: any;
  onChangePos: (pos: IPos) => void;
}) {
  return (
    <Wrapper.Sidebar>
      <PosList
        onChangePos={onChangePos}
        queryParams={queryParams}
        history={history}
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
