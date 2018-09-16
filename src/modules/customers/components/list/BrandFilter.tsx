import { DataWithLoader } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';
import { withRouter } from 'react-router';

type Props = {
  history: any,
  location: any,
  match: any,
  counts: any,
  brands: IBrand[],
  loading: boolean
};

function Brands({ history, counts, brands, loading }: Props) {
  const { Section, Header } = Wrapper.Sidebar;

  const data = (
    <SidebarList>
      {brands.map(brand => (
        <li key={brand._id}>
          <a
            tabIndex={0}
            className={
              router.getParam(history, 'brand') === brand._id ? 'active' : ''
            }
            onClick={() => {
              router.setParams(history, { brand: brand._id });
            }}
          >
            {brand.name}
            <SidebarCounter>{counts[brand._id]}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Section collapsible={brands.length > 5}>
      <Header uppercase>{__('Filter by brand')}</Header>

      <DataWithLoader
        data={data}
        loading={loading}
        count={brands.length}
        emptyText="No brands"
        emptyIcon="pie-graph"
        size="small"
        objective={true}
      />
    </Section>
  );
}

export default withRouter<Props>(Brands);