import { Button, ModalTrigger } from 'modules/common/components';
import { ICustomer } from 'modules/customers/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import { IEngageMessageDoc } from '../types';
import WidgetForm from './WidgetForm';

type Props = {
  emailTemplates: IEmailTemplate[];
  brands: IBrand[];
  customers: ICustomer[];
  messengerKinds: any[];
  sentAsChoices: any[];
  save: (doc: IEngageMessageDoc, closeModal: () => void) => void;
}

class Widget extends React.Component<Props> {
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
