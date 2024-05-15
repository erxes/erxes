import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InsuranceProduct } from '../../../gql/types';
import { FilterLabel } from '../../../styles';

interface IProps {
  counts: { [key: string]: number };
  products: InsuranceProduct[];
  loading: boolean;
  emptyText?: string;
}

function Products({

  counts,
  products,
  loading,
  emptyText,
}: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const data = (
    <SidebarList>
      {products.map((product) => {
        const onClick = () => {
          router.setParams(navigate, location, { product: product._id });
          router.removeParams(navigate, location, 'page');
        };

        return (
          <li key={product._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, 'product') === product._id
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FilterLabel>{product.name}</FilterLabel>
              <SidebarCounter>{counts[product._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by product')}
      collapsible={products.length > 5}
      name="productFilter"
        isOpen={true}
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={products.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default Products;
