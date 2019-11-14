import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';
import { withRouter } from 'react-router';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  brands: IBrand[];
  loading: boolean;
}

function Brands({ history, counts, brands, loading }: IProps) {
  const data = (
    <SidebarList>
      {brands.map(brand => {
        const onClick = () => {
          router.setParams(history, { brand: brand._id });
        };

        return (
          <li key={brand._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'brand') === brand._id ? 'active' : ''
              }
              onClick={onClick}
            >
              {brand.name}
              <SidebarCounter>{counts[brand._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by brand')}
      collapsible={brands.length > 5}
      name="showFilterByBrand"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={brands.length}
        emptyText="Now easier to find contacts according to your brand"
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Brands);
