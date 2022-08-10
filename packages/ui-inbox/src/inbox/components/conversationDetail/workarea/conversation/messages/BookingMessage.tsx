import { MessageBody, MessageContent, MessageItem } from '../styles';

import FormMessage from './FormMessage';
import { IMessage } from '../../../../../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { urlify } from '@erxes/ui/src/utils/urlParser';
import xss from 'xss';

type Props = {
  message: IMessage;
  isSameUser: boolean;
};

export default class AppMessage extends React.Component<Props, {}> {
  renderAvatar() {
    const { message, isSameUser } = this.props;

    if (isSameUser) {
      return null;
    }

    const user = message.user;
    const customer = message.customer;
    const props = user ? { user } : { customer };

    return <NameCard.Avatar {...props} />;
  }

  renderContent() {
    const { message } = this.props;

    return (
      <>
        <MessageContent internal={false}>
          <span
            dangerouslySetInnerHTML={{ __html: xss(urlify(message.content)) }}
          />
        </MessageContent>
      </>
    );
  }

  render() {
    const { isSameUser, message } = this.props;
    const { bookingWidgetData, createdAt } = message;

    return (
      <>
        <FormMessage message={bookingWidgetData} />
        <MessageItem isSame={isSameUser}>
          {this.renderAvatar()}

          <MessageBody>
            {this.renderContent()}
            <Tip text={dayjs(createdAt).format('lll')}>
              <footer>{dayjs(createdAt).format('LT')}</footer>
            </Tip>
          </MessageBody>
        </MessageItem>
      </>
    );
  }
}
