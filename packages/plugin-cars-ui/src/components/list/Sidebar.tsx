import { Wrapper } from '@erxes/ui/src';
import React from 'react';
import CategoryList from '../../containers/carCategory/CategoryList';

function Sidebar({
  loadingMainQuery,
  queryParams,
}: {
  loadingMainQuery: boolean;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <CategoryList queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
