import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ICustomer } from 'modules/customers/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React from 'react';
import { IBrand } from '../../settings/brands/types';
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
