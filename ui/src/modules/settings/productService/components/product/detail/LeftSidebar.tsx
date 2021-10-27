import gql from 'graphql-tag';
import { TaggerSection } from 'modules/customers/components/common';
import Sidebar from 'modules/layout/components/Sidebar';
import BasicInfo from 'modules/settings/productService/containers/product/detail/BasicInfo';
import CustomFieldsSection from 'modules/settings/productService/containers/product/detail/CustomFieldsSection';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import { queries } from '../../../graphql';

type Props = {
  product: IProduct;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.productDetail),
        variables: { _id: product._id }
      }
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo product={product} refetchQueries={refetchQueries} />
        <CustomFieldsSection product={product} />
        <TaggerSection
          data={product}
          type="product"
          refetchQueries={refetchQueries}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
