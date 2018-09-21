import { Button, ModalTrigger } from 'modules/common/components';
import { ICustomer } from 'modules/customers/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React, { Component } from 'react';
import { IBrand } from '../../settings/brands/types';
import WidgetForm from './WidgetForm';

type Doc = {
  title: string;
  customerIds: string[];
  method: string;
  email: object | {
    templateId: string;
    subject: string;
    attachments: string[];
    content: string;
  }, 
  messenger: object | {
    brandId: string;
    kind: string;
    sentAs: string;
    content: string;
  }
}

type Props = {
  emailTemplates: IEmailTemplate[];
  brands: IBrand[];
  customers: ICustomer[];
  messengerKinds: any[];
  sentAsChoices: any[];
  save: (doc: Doc, closeModal: () => void) => void;
}

class Widget extends Component<Props> {
  render() {
    const trigger = (
      <Button btnStyle="success" size="small" icon="email">
        Message
      </Button>
    );

    return (
      <ModalTrigger 
        title="New message" 
        trigger={trigger}
        content={(props) => <WidgetForm {...this.props} {...props} />}
      />
    );
  }
}

export default Widget;
