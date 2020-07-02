import { IUser } from 'modules/auth/types';
import EmailForm from 'modules/engage/containers/EmailForm';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import React from 'react';
import { METHODS } from '../../constants';
import {
  IEngageEmail,
  IEngageMessenger,
  IEngageScheduleDate
} from '../../types';
import MessengerForm from '../MessengerForm';

type Props = {
  brands: IBrand[];
  onChange: (
    name: 'messenger' | 'email' | 'content' | 'scheduleDate' | 'fromUserId',
    value?: IEngageEmail | IEngageMessenger | IEngageScheduleDate | string
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

    if (method === METHODS.EMAIL) {
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
