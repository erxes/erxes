import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import FormContainer from '../containers/Form';
import SidebarContainer from '../containers/Sidebar';

const Products = () => {
  const renderContent = () => <FormContainer />;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sales Plans - Products')}
          breadcrumb={[{ title: __('Sales Plans - Products') }]}
        />
      }
      content={renderContent()}
      leftSidebar={<SidebarContainer />}
    />
  );
};

export default Products;
