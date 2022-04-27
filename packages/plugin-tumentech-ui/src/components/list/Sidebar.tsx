import { Wrapper } from 'erxes-ui';
import React from 'react';

import CategoryList from '../../containers/carCategory/CategoryList';
import { IProduct, IProductCategory } from '../../types';
import { IButtonMutateProps } from 'erxes-ui/lib/types';

function Sidebar({
  loadingMainQuery,
  history,
  queryParams,
  products,
  onSelect,
  saveMatch,
  productCategories,
  renderButton
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
  products: IProduct[];
  onSelect: (prs: IProduct[]) => void;
  saveMatch: () => void;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
}) {
  return (
    <Wrapper.Sidebar>
      <CategoryList
        queryParams={queryParams}
        history={history}
        products={products}
        onSelect={onSelect}
        saveMatch={saveMatch}
        renderButton={renderButton}
        productCategories={productCategories}
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
