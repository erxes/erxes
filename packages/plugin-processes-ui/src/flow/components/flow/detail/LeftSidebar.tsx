import gql from 'graphql-tag';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from '../../../containers/flow/detail/BasicInfo';
import CustomFieldsSection from '../../../containers/flow/detail/CustomFieldsSection';
import React from 'react';
import { queries } from '../../../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IProduct } from '@erxes/ui-products/src/types';

type Props = {
  product: IProduct;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.flowDetail),
        variables: { _id: product._id }
      }
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo product={product} refetchQueries={refetchQueries} />
        <CustomFieldsSection product={product} />
        {isEnabled('tags') && (
          <TaggerSection
            data={product}
            type="products:product"
            refetchQueries={refetchQueries}
          />
        )}
      </Sidebar>
    );
  }
}

export default LeftSidebar;
