import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { __, renderFullName } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IUser } from '../../../auth/types';
import { ICustomer } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  taggerRefetchQueries?: any[];
};

class CustomerDetails extends React.Component<Props> {
  render() {
    const { customer, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Customers'), link: '/customers' },
      { title: renderFullName(customer) }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={customer._id}
          contentType="customer"
          toEmail={customer.primaryEmail}
          showEmail={true}
        />
        <ActivityLogs
          target={customer.firstName}
          contentId={customer._id}
          contentType="customer"
          extraTabs={[
            { name: 'conversation', label: 'Conversation' },
            { name: 'email', label: 'Email' }
          ]}
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <LeftSidebar
            wide={true}
            customer={customer}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar customer={customer} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
