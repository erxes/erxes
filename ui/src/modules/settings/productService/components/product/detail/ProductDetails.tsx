import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import LeftSidebar from './LeftSidebar';

type Props = {
  product: IProduct;
  currentUser: IUser;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const title = product.name || 'Unknown';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service'), link: '/settings/product-service' },
      { title }
    ];

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
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CompanyDetails;
