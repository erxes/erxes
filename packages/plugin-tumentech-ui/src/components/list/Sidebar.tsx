import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';

import CategoryList from '../../containers/carCategory/CategoryList';
import SegmentFilter from '../../containers/SegmentFilter';
import { IProduct, IProductCategory } from '../../types';

function Sidebar({
  loadingMainQuery,
  history,
  queryParams,
  products,
  saveMatch,
  productCategories,
  renderButton
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
  products: IProduct[];
  saveMatch: () => void;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('segments') && (
        <SegmentFilter loadingMainQuery={loadingMainQuery} />
      )}
      <CategoryList
        queryParams={queryParams}
        history={history}
        products={products}
        saveMatch={saveMatch}
        renderButton={renderButton}
        productCategories={productCategories}
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
