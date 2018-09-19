import { IUser } from 'modules/auth/types';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React, { Component } from 'react';
import { EmailForm, MessengerForm } from '../';

type Props = {
  brands: IBrand[],
  changeState: (name: string, value: string) => void,
  users: IUser[],
  method: string,
  templates: IEmailTemplate[],
  defaultValue: any,
  kind: string
};

class MessageStep extends Component<Props> {
  render() {
    const {
      brands,
      changeState,
      users,
      method,
      templates,
      defaultValue,
      kind
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          changeEmail={changeState}
          defaultValue={defaultValue}
          users={users}
          templates={templates}
          kind={kind}
        />
      );
    }

    return (
      <MessengerForm
        brands={brands}
        changeMessenger={changeState}
        defaultValue={defaultValue}
        users={users}
        hasKind={true}
        kind={kind}
      />
    );
  }
}

export default MessageStep;
