import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import FormListContainer from '../containers/FormList';
import SidebarContainer from '../containers/Sidebar';

const Products = () => {
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sales Plans - Products')}
          breadcrumb={[{ title: __('Sales Plans - Products') }]}
        />
      }
      content={<FormListContainer />}
      leftSidebar={<SidebarContainer />}
    />
  );
};

export default Products;
