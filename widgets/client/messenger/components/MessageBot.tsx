import * as React from 'react';
import * as xss from 'xss';
import { IUser } from '../../types';
import { __, urlify } from '../../utils';
import { IBotData } from '../types';
import Bot from './bot/Bot';
import Carousel from './bot/Carousel';
import CustomMessage from './bot/CustomMessage';

type Props = {
  botData: IBotData[];
  createdAt: Date;
  user?: IUser;
  color?: string;
  textColor?: string;
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  conversationId: string;
  scrollBottom: () => void;
};

type CommonProps = {
  conversationId: string;
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
};

function MessageBot(props: Props) {
  const {
    conversationId,
    botData,
    replyAutoAnswer,
    sendTypingInfo,
    scrollBottom
  } = props;

  const renderTextMessage = (message: IBotData) => {
    return (
      <div
        className="erxes-message top"
        dangerouslySetInnerHTML={{ __html: xss(urlify(message.text || '')) }}
      />
    );
  };

  const renderFileMessage = (message: IBotData) => {
    return (
      <div className="bot-message">
        <img onLoad={scrollBottom} src={message.url} />
      </div>
    );
  };

  const renderCustomMessage = (message: IBotData, commonProps: CommonProps) => {
    return <CustomMessage message={message} {...commonProps} />;
  };

  const renderCarouselMessage = (elements: any, commonProps: CommonProps) => {
    return (
      <Carousel
        scrollBottom={scrollBottom}
        items={elements}
        {...commonProps}
      />
    );
  };

  function renderBotMessage() {
    const commonProps = {
      conversationId,
      replyAutoAnswer,
      sendTypingInfo
    };

    return botData.map(item => {
      switch (item.type) {
        case 'text':
          return renderTextMessage(item);
        case 'file':
          return renderFileMessage(item);
        case 'carousel':
          return renderCarouselMessage(item.elements, commonProps);
        case 'custom':
          return renderCustomMessage(item, commonProps);
        default:
          return null;
      }
    });
  }

  return (
    <li>
      <Bot />
      {renderBotMessage()}
    </li>
  );
}

export default MessageBot;
