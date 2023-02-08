import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import StateFilter from './StateFilter';
import CategoryApprovalStateFilter from './CategoryApprovalStateFilter';
import CategoriesFilter from '../../containers/posts/CategoriesFilter';

function Sidebar() {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <StateFilter />
      <CategoryApprovalStateFilter />
      <CategoriesFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
