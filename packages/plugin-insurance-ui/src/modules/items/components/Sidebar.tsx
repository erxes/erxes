import React, { useState, useEffect } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import CategoryFilter from '../containers/CategoryFilter';
import ProductFilter from '../containers/ProductsFilter';
import Filters from './Filters';
import VendorFilter from '../containers/VendorFilter';
import DateFilter from './DateFilter';
import { InputBar } from '@erxes/ui-settings/src/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import { __, router } from '@erxes/ui/src/utils/core';
import { IRouterProps } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';
import { FilterContainer } from '../../../styles';

interface IProps extends IRouterProps {
  loadingMainQuery: boolean;
  queryParams: any;
}

const Sidebar = (props: IProps) => {
  const { loadingMainQuery, queryParams, history } = props;
  const [abortController] = useState(new AbortController());
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  let timer;

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, [abortController]);

  const onCategoriesLoad = (categories) => {
    setCategories(categories);
  };

  const onProductsLoad = (products) => {
    setProducts(products);
  };

  const onVendorsLoad = (vendors) => {

    setVendors(vendors);
  };

  const onSearch = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;
    setSearchValue(inputValue);

    timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue: inputValue });
    }, 500);
  };

  return (
    <Wrapper.Sidebar hasBorder wide={true}>
      <FilterContainer>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FormControl
            type="text"
            placeholder={__('Contract Number')}
            onChange={onSearch}
            value={searchValue}
            autoFocus={false}
            // onFocus={moveCursorAtTheEnd}
          />
        </InputBar>
      </FilterContainer>

      <Filters
        queryParams={queryParams}
        categories={categories}
        products={products}
        vendors={vendors}
        history={history}
      />
      <CategoryFilter
        loadingMainQuery={loadingMainQuery}
        abortController={abortController}
        queryCallback={onCategoriesLoad}
      />
      <ProductFilter
        loadingMainQuery={loadingMainQuery}
        abortController={abortController}
        queryParams={queryParams}
        queryCallback={onProductsLoad}
      />

      <VendorFilter
        loadingMainQuery={loadingMainQuery}
        abortController={abortController}
        queryParams={queryParams}
        queryCallback={onVendorsLoad}
      />

      <DateFilter loading={loadingMainQuery} queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
};

export default withRouter<IProps>(Sidebar);
