import gql from 'graphql-tag';
import { TaggerSection } from 'modules/customers/components/common';
import Sidebar from 'modules/layout/components/Sidebar';
import BasicInfo from 'modules/settings/template/containers/product/detail/BasicInfo';
import { IProductTemplate } from '../../../types';
import React from 'react';
import { queries } from '../../../graphql';

type Props = {
  productTemplate: IProductTemplate;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { productTemplate } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.productTemplateDetail),
        variables: { _id: productTemplate._id }
      }
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo productTemplate={productTemplate} />
        <TaggerSection
          data={productTemplate}
          type="product"
          refetchQueries={refetchQueries}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
