import { IUser } from '@erxes/ui/src/auth/types';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { IEmailTemplate } from '@erxes/ui-settings/src/emailTemplates/types';
import React from 'react';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IEngageMessageDoc } from '../types';
import WidgetForm from './WidgetForm';

type Props = {
  emailTemplates: IEmailTemplate[];
  brands: IBrand[];
  customers: ICustomer[];
  messengerKinds: any[];
  sentAsChoices: any[];
  modalTrigger?: React.ReactNode;
  currentUser: IUser;
  save: (doc: IEngageMessageDoc, closeModal: () => void) => void;
};

class Widget extends React.Component<Props> {
  getTrigger = () => {
    const trigger = this.props.modalTrigger;

    if (trigger) {
      return trigger;
    }

    return (
      <Button btnStyle="success" size="small" icon="envelope-alt">
        Message
      </Button>
    );
  };

  render() {
    const content = props => <WidgetForm {...this.props} {...props} />;

    return (
      <ModalTrigger
        size="lg"
        title="Quick message"
        trigger={this.getTrigger()}
        content={content}
        enforceFocus={false}
      />
    );
  }
}

export default Widget;
