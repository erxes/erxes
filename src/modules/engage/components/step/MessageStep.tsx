import { IUser } from 'modules/auth/types';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React from 'react';
import { EmailForm, MessengerForm } from '../';
import {
  IEngageEmail,
  IEngageMessenger,
  IEngageScheduleDate
} from '../../types';

type Props = {
  brands: IBrand[];
  onChange: (
    name: 'messenger' | 'email' | 'content' | 'scheduleDate' | 'fromUserId',
    value: IEngageEmail | IEngageMessenger | IEngageScheduleDate | string
  ) => void;
  users: IUser[];
  method: string;
  templates: IEmailTemplate[];
  kind: string;
  messenger?: IEngageMessenger;
  email?: IEngageEmail;
  fromUserId: string;
  content: string;
  scheduleDate: IEngageScheduleDate;
};

class MessageStep extends React.Component<Props> {
  render() {
    const {
      brands,
      onChange,
      users,
      method,
      templates,
      kind,
      messenger,
      email,
      fromUserId,
      content,
      scheduleDate
    } = this.props;

    if (method === 'email') {
      return (
        <EmailForm
          onChange={onChange}
          users={users}
          templates={templates}
          kind={kind}
          email={email || ({} as IEngageEmail)}
          fromUserId={fromUserId}
          content={content}
          scheduleDate={scheduleDate}
        />
      );
    }

    return (
      <MessengerForm
        brands={brands}
        onChange={onChange}
        users={users}
        hasKind={true}
        messageKind={kind}
        messenger={messenger || ({} as IEngageMessenger)}
        fromUserId={fromUserId}
        content={content}
        scheduleDate={scheduleDate}
      />
    );
  }
}

export default MessageStep;
