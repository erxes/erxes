import ActivityInputs from '@erxes/ui/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui/src/activityLogs/containers/ActivityLogs';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { TabTitle } from '@erxes/ui/src/components/tabs';
import { __, renderFullName } from 'coreui/utils';
import ActionSection from '@erxes/ui-contacts/src/customers/containers/ActionSection';
import LeadState from '@erxes/ui-contacts/src/customers/containers/LeadState';
import { MailBox, UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Widget from '@erxes/ui-engage/src/containers/Widget';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import MailForm from '@erxes/ui-settings/src/integrations/containers/mail/MailForm';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { ICustomer } from '../../types';
import InfoSection from '@erxes/ui-contacts/src/customers/components/common/InfoSection';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  customer: ICustomer;
  fieldsVisibility: IFieldsVisibility;
  deviceFields: IField[];
  taggerRefetchQueries?: any[];
  deviceFieldsVisibility: IFieldsVisibility;
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
        size="xl"
        content={content}
        paddingContent="less-padding"
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

    if (isEnabled('engages')) {
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
    }

    return null;
  };

  render() {
    const {
      customer,
      deviceFields,
      taggerRefetchQueries,
      fieldsVisibility,
      deviceFieldsVisibility
    } = this.props;

    const breadcrumb = [
      { title: __('Contacts'), link: '/contacts' },
      { title: renderFullName(customer) }
    ];

    const content = (
      <>
        <ActivityInputs
          contentTypeId={customer._id}
          contentType="contacts:customer"
          toEmail={customer.primaryEmail}
          showEmail={false}
          extraTabs={this.renderExtraTabs()}
        />
        {isEnabled('logs') && (
          <ActivityLogs
            target={customer.firstName}
            contentId={customer._id}
            contentType="customer"
            extraTabs={[
              { name: 'conversation', label: 'Conversation' },
              { name: 'email', label: 'Email' },
              { name: 'task', label: 'Task' },
              { name: 'sms', label: 'SMS' },
              { name: 'campaign', label: 'Campaign' }
            ]}
          />
        )}
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
        mainHead={
          <UserHeader>
            <InfoSection nameSize={16} avatarSize={60} customer={customer}>
              <ActionSection customer={customer} />
            </InfoSection>
            <LeadState customer={customer} />
          </UserHeader>
        }
        leftSidebar={
          <LeftSidebar
            wide={true}
            customer={customer}
            fieldsVisibility={fieldsVisibility}
            deviceFields={deviceFields}
            taggerRefetchQueries={taggerRefetchQueries}
            deviceFieldsVisibility={deviceFieldsVisibility}
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
