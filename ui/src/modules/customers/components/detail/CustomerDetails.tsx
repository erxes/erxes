import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TabTitle } from 'modules/common/components/tabs';
import { __, renderFullName } from 'modules/common/utils';
import Widget from 'modules/engage/containers/Widget';
import { MailBox } from 'modules/inbox/components/conversationDetail/sidebar/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import { ICustomer } from '../../types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  taggerRefetchQueries?: any[];
};

class CustomerDetails extends React.Component<Props> {
  renderEmailTab = () => {
    const { customer } = this.props;

    if (!customer.primaryEmail) {
      return null;
    }

    const triggerEmail = (
      <TabTitle>
        <Icon icon="envelope-add" /> {__('New email')}
      </TabTitle>
    );

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={customer.primaryEmail}
          refetchQueries={['activityLogsCustomer']}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    return (
      <ModalTrigger
        dialogClassName="middle"
        title="Email"
        trigger={triggerEmail}
        size="lg"
        content={content}
        paddingContent="no-padding"
        enforceFocus={false}
      />
    );
  };

  renderExtraTabs = () => {
    const triggerMessenger = (
      <TabTitle>
        <Icon icon="comment-plus" /> {__('New message')}
      </TabTitle>
    );

    return (
      <>
        <Widget
          customers={[this.props.customer]}
          modalTrigger={triggerMessenger}
          channelType="messenger"
        />
        {this.renderEmailTab()}
      </>
    );
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
          extraTabs={this.renderExtraTabs()}
        />
        <ActivityLogs
          target={customer.firstName}
          contentId={customer._id}
          contentType="customer"
          extraTabs={[
            { name: 'conversation', label: 'Conversation' },
            { name: 'email', label: 'Email' },
            { name: 'task', label: 'Task' }
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
