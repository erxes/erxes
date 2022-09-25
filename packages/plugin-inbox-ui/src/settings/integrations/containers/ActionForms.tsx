import { IUser, IUserDetails } from '@erxes/ui/src/auth/types';

import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { MailBox } from '@erxes/ui-contacts/src/customers/styles';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SmsForm from '@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  user: IUser;
};

class ActionForms extends React.Component<Props, {}> {
  render() {
    const { user } = this.props;
    const { operatorPhone } = user.details || ({} as IUserDetails);

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={user.email}
          customerId={user._id || undefined}
          refetchQueries={['activityLogsUser']}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    const smsForm = props => (
      <SmsForm {...props} primaryPhone={operatorPhone} />
    );

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button
              disabled={user.email ? false : true}
              size="small"
              btnStyle={user.email ? 'primary' : 'simple'}
            >
              <Tip text="Send e-mail" placement="top-end">
                <Icon icon="envelope" />
              </Tip>
            </Button>
          }
          size="lg"
          content={content}
          paddingContent="less-padding"
          enforceFocus={false}
        />

        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${operatorPhone})`}
          trigger={
            <Button
              disabled={operatorPhone ? false : true}
              size="small"
              btnStyle={operatorPhone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
      </>
    );
  }
}

export default ActionForms;
