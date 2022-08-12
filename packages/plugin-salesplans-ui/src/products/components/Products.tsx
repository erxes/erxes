import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import WithPermission from 'coreui/withPermission';
import ListContainer from '../containers/List';
import CategoryFilter from '../containers/CategoryFilter';

const Products = () => {
  const breadcrumbs = [
    { title: __('Sales Plans'), link: '/sales-plans' },
    { title: __('Products') }
  ];

  return (
    <WithPermission action="showSalesPlans">
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sales Plans - Products')}
            breadcrumb={breadcrumbs}
          />
        }
        content={<ListContainer />}
        leftSidebar={
          <Wrapper.Sidebar hasBorder>
            <CategoryFilter />
          </Wrapper.Sidebar>
        }
        hasBorder
      />
    </WithPermission>
  );
};

export default Products;
