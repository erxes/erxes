import { Button, ModalTrigger } from 'modules/common/components';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React, { Component } from 'react';
import { IBrand } from '../../settings/brands/types';
import WidgetForm from './WidgetForm';

type Props = {
  emailTemplates: IEmailTemplate[],
  brands: IBrand[],
  messengerKinds: any[],
  sentAsChoices: any[],
  save: (doc: any, closeModal: () => void) => void,
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
