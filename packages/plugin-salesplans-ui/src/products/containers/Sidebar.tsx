import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import SidebarComponent from '../components/Sidebar';

const SidebarContainer = () => {
  const productCategoriesQuery = useQuery(gql(queries.productCategories));

  return (
    <SidebarComponent
      categories={
        productCategoriesQuery.data &&
        productCategoriesQuery.data.productCategories
      }
      loading={productCategoriesQuery.loading}
    />
  );
};

export default SidebarContainer;
