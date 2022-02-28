import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IProductTemplate } from '../../../types';
import React from 'react';
import LeftSidebar from './LeftSidebar';

type Props = {
  productTemplate: IProductTemplate;
  currentUser: IUser;
};

class CompanyDetails extends React.Component<Props> {
  render() {
    const { productTemplate } = this.props;

    const title = productTemplate.title || 'Unknown';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Product & Service'), link: '/settings/product-service' },
      { title }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={productTemplate._id}
          contentType="productTemplate"
          showEmail={false}
        />
        <ActivityLogs
          target={productTemplate.title || ''}
          contentId={productTemplate._id}
          contentType="productTemplate"
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
