import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import ListContainer from '../containers/List';
import CategoryFilter from './filters/CategoryFilter';

type Props = {
  categories: any[];
};

const Products = (props: Props) => {
  const { categories = [] } = props;
  const breadcrumbs = [
    { title: __('Sales Plans'), link: '/sales-plans' },
    { title: __('Products') }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sales Plans - Products')}
          breadcrumb={breadcrumbs}
        />
      }
      content={<ListContainer />}
      leftSidebar={
        <Wrapper.Sidebar>
          <CategoryFilter categories={categories} />
        </Wrapper.Sidebar>
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default Products;
