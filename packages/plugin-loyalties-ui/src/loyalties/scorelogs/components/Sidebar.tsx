import { Wrapper } from '@erxes/ui/src';
import React from 'react';
import { PaddingTop } from '../../../styles';
function SideBar({
  loadingMainQuery,
  history,
  queryParams
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar>
      <PaddingTop>shit</PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default SideBar;
