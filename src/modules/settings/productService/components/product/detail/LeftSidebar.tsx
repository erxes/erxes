import Sidebar from 'modules/layout/components/Sidebar';
import BasicInfo from 'modules/settings/productService/containers/product/detail/BasicInfo';
import CustomFieldsSection from 'modules/settings/productService/containers/product/detail/CustomFieldsSection';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';

type Props = {
  product: IProduct;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { product } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfo product={product} />
        <CustomFieldsSection product={product} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
