import classNames = require('classnames');
import * as dayjs from 'dayjs';
import * as React from 'react';
import * as xss from 'xss';
import { IUser } from '../../types';
import { __, urlify } from '../../utils';
import { IBotData } from '../types';
import Bot from './botpress/Bot';
import Carousel from './botpress/Carousel';
import CustomMessage from './botpress/CustomMessage';

type Props = {
  botData: IBotData;
  isBotMessage?: boolean;
  createdAt: Date;
  user?: IUser;
  color?: string;
  textColor?: string;
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  conversationId: string;
};

function MessageBot(props: Props) {
  const {
    conversationId,
    user,
    color,
    textColor,
    createdAt,
    botData,
    isBotMessage,
    replyAutoAnswer,
    sendTypingInfo
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
            <img src={url} />
          </div>
        );
      case 'carousel':
        return <Carousel items={elements} {...commonProps} />;
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
