import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import { Icon, TabTitle } from 'modules/common/components';
import { __, renderFullName } from 'modules/common/utils';
import { Widget } from 'modules/engage/containers';
import { Wrapper } from 'modules/layout/components';
import React from 'react';
import { ICustomer } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  taggerRefetchQueries?: any[];
};

class CustomerDetails extends React.Component<Props> {
  renderExtraTab = () => {
    const trigger = (
      <TabTitle>
        <Icon icon="speech-bubble-3" /> {__('Chat message')}
      </TabTitle>
    );

    return <Widget customers={[this.props.customer]} modalTrigger={trigger} />;
  };

  render() {
    const { customer, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Contacts'), link: '/contacts' },
      { title: __('Customers'), link: '/contacts/customers/all' },
      { title: renderFullName(customer) }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={customer._id}
          contentType="customer"
          toEmail={customer.primaryEmail}
          showEmail={false}
          extraTab={this.renderExtraTab()}
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
        header={
          <Wrapper.Header
            title={renderFullName(customer)}
            breadcrumb={breadcrumb}
          />
        }
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
