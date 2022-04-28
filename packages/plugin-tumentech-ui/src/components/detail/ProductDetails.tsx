import ActivityInputs from 'erxes-ui/lib/activityLogs/components/ActivityInputs';
import ActivityLogs from 'erxes-ui/lib/activityLogs/containers/ActivityLogs';
import { IUser } from 'erxes-ui/lib/auth/types';
import { IProduct } from '../../types';
import React from 'react';
import { __, Wrapper } from 'erxes-ui';

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
