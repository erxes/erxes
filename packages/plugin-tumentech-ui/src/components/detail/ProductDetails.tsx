import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import { IProduct } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

type Props = {
  product: IProduct;
  currentUser: IUser;
};

class ProductDetails extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const title = product.name || 'Unknown';

    const content = (
      <>
        <ActivityInputs
          contentTypeId={product._id}
          contentType="product"
          showEmail={false}
        />
        <ActivityLogs
          target={product.name || ''}
          contentId={product._id}
          contentType="product"
          extraTabs={[]}
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default ProductDetails;
