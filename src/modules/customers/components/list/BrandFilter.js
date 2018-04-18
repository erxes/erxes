import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';

const propTypes = {
  history: PropTypes.object,
  counts: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Brands({ history, counts, brands, loading }, { __ }) {
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
    <Section>
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

Brands.propTypes = propTypes;
Brands.contextTypes = {
  __: PropTypes.func
};

export default withRouter(Brands);
