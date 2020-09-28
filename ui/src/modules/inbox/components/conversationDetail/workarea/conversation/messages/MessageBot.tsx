import dayjs from 'dayjs';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { urlify } from 'modules/inbox/utils';
import React from 'react';
import xss from 'xss';
import { IMessage } from '../../../../../types';
import { MessageBody, MessageContent, MessageItem } from '../styles';
import Carousel from './bot/Carousel';
import CustomMessage from './bot/CustomMessage';

type Props = {
  message: IMessage;
};

export default class SimpleMessage extends React.Component<Props, {}> {
  renderAvatar() {
    return (
      <NameCard.Avatar
        user={{ _id: 'asd', username: 'bot', email: 'erxes@.io' }}
      />
    );
  }

  renderContent() {
    const { message } = this.props;
    const { botData } = message;
    const { type, text, elements, url } = botData;

    switch (type) {
      case 'text':
        return (
          <MessageContent staff={false}>
            <span
              dangerouslySetInnerHTML={{ __html: xss(urlify(text || '')) }}
            />
          </MessageContent>
        );
      case 'file':
        return (
          <img src={url} alt="bot-img" style={{ width: 200, height: 200 }} />
        );
      case 'carousel':
        return <Carousel items={elements} />;
      case 'custom':
        return <CustomMessage botData={botData} />;
      default:
        return null;
    }
  }

  render() {
    const {
      message: { createdAt }
    } = this.props;

    return (
      <MessageItem staff={false}>
        {this.renderAvatar()}

        <MessageBody staff={false}>
          {this.renderContent()}
          <Tip text={dayjs(createdAt).format('lll')}>
            <footer>{dayjs(createdAt).format('LT')}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
    );
  }
}
