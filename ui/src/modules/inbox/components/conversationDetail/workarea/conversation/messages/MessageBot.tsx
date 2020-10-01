import dayjs from 'dayjs';
import ImageWithPreview from 'modules/common/components/ImageWithPreview';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { urlify } from 'modules/inbox/utils';
import React from 'react';
import xss from 'xss';
import { IBotData, IMessage } from '../../../../../types';
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
        user={{ _id: 'erxes_bot', username: 'bot', email: 'info@erxes.io' }}
      />
    );
  }

  renderTextMessage = (message: IBotData, index: number) => {
    return (
      <MessageContent staff={true} key={index}>
        <span
          dangerouslySetInnerHTML={{ __html: xss(urlify(message.text || '')) }}
        />
      </MessageContent>
    );
  };

  renderFileMessage = (message: IBotData, index: number) => {
    return (
      <MessageContent staff={true} key={index}>
        <ImageWithPreview src={message.url} alt={message.title || ''} />
      </MessageContent>
    );
  };

  renderCustomMessage = (message: IBotData, index: number) => {
    return <CustomMessage key={index} botData={message} />;
  };

  renderCarouselMessage = (elements: any, index: number) => {
    return (
      <Carousel key={index} items={elements} />
    );
  };

  renderBotMessage() {
    const { message } = this.props;
    const { botData } = message;

    return botData.map((item, index) => {
      switch (item.type) {
        case 'text':
          return this.renderTextMessage(item, index);
        case 'file':
          return this.renderFileMessage(item, index);
        case 'carousel':
          return this.renderCarouselMessage(item.elements, index);
        case 'custom':
          return this.renderCustomMessage(item, index);
        default:
          return null;
      }
    });
  }

  render() {
    const { message: { createdAt }} = this.props;

    return (
      <MessageItem staff={false} isBot={true}>
        {this.renderAvatar()}
        <MessageBody staff={false}>
          <Tip text={dayjs(createdAt).format('lll')}>
            <footer>{dayjs(createdAt).format('LT')}</footer>
          </Tip>
          {this.renderBotMessage()}
        </MessageBody>
      </MessageItem>
    );
  }
}
