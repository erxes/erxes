import ActivityInputs from '@erxes/ui-log/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';
import { IProduct } from '../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import LeftSidebar from './LeftSidebar';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
          contentType="products:product"
          showEmail={false}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={product.name || ''}
            contentId={product._id}
            contentType="products:product"
            extraTabs={[]}
          />
        )}
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
