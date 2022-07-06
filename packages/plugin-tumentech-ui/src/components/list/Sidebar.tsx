import { Wrapper } from '@erxes/ui/src';
import React from 'react';

import SegmentFilter from '../../containers/SegmentFilter';
import CategoryList from '../../containers/carCategory/CategoryList';
import { IProduct, IProductCategory } from '../../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
    <Wrapper.Sidebar>
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
