import * as React from 'react';
import * as xss from 'xss';
import { IUser } from '../../types';
import { __, urlify } from '../../utils';
import { IBotData } from '../types';
import Bot from './bot/Bot';
import Carousel from './bot/Carousel';
import CustomMessage from './bot/CustomMessage';

type Props = {
  botData: IBotData;
  createdAt: Date;
  user?: IUser;
  color?: string;
  textColor?: string;
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  conversationId: string;
  scrollBottom: () => void;
};

function MessageBot(props: Props) {
  const {
    conversationId,
    user,
    color,
    textColor,
    createdAt,
    botData,
    replyAutoAnswer,
    sendTypingInfo,
    scrollBottom
  } = props;

  function renderBotMessage() {
    const { type, text, elements, url } = botData;

    const commonProps = {
      conversationId,
      replyAutoAnswer,
      sendTypingInfo
    };

    switch (type) {
      case 'text':
        return (
          <div
            className="erxes-message top"
            dangerouslySetInnerHTML={{ __html: xss(urlify(text || '')) }}
          />
        );
      case 'file':
        return (
          <div className="bot-message">
            <img onLoad={scrollBottom} src={url} />
          </div>
        );
      case 'carousel':
        return (
          <Carousel
            scrollBottom={scrollBottom}
            items={elements}
            {...commonProps}
          />
        );
      case 'custom':
        return <CustomMessage message={botData} {...commonProps} />;
      default:
        return null;
    }
  }

  return (
    <li>
      <Bot />
      {renderBotMessage()}
    </li>
  );
}

export default MessageBot;
