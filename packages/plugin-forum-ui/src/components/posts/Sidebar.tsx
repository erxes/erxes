import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import StateFilter from './StateFilter';
import CategoryApprovalStateFilter from './CategoryApprovalStateFilter';
import { Counts } from '@erxes/ui/src/types';
import { ICategory } from '../../types';
import CategoriesFilter from '../../containers/PostsList/CategoriesFilter';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  };
  categories?: ICategory[];
};

function Sidebar({ counts, categories }: Props) {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <StateFilter counts={counts.byStatus} />
      <CategoryApprovalStateFilter counts={counts.byStatus} />
      <CategoriesFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
