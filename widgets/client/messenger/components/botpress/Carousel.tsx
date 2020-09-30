import * as React from 'react';
import { BUTTON_TYPES } from './constants';

type CarouselButton = {
  type: string;
  title: string;
  text: string;
  payload: string;
  url?: string;
};

export interface ICarouselItem {
  title: string;
  picture?: string;
  subtitle?: string;
  buttons?: CarouselButton[];
}

type Props = {
  conversationId: string;
  items?: ICarouselItem[];
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
};

export default function Carousel({ items, replyAutoAnswer }: Props) {
  if (!items || items.length === 0) {
    return null;
  }

  function renderButton(button: CarouselButton) {
    const { type, title, text, url, payload } = button;

    if (type === BUTTON_TYPES.saySomething) {
      const handleClick = () => replyAutoAnswer(title, text);

      return (
        <div onClick={handleClick} className="bot-action">
          {title}
        </div>
      );
    }

    if (type === BUTTON_TYPES.openUrl) {
      return (
        <a className="bot-action" target="_blank" href={url}>
          {title}
        </a>
      );
    }

    const handlePostBack = () => replyAutoAnswer(title, payload);

    return (
      <div onClick={handlePostBack} className="bot-action">
        {title}
      </div>
    );
  }

  function renderActions(buttons?: CarouselButton[]) {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    return (
      <div className="bot-actions">
        {buttons.map((button, idx) => (
          <div key={idx}>{renderButton(button)}</div>
        ))}
      </div>
    );
  }

  const renderItem = (item: ICarouselItem, index: number) => {
    return (
      <div className="carousel-item" key={index}>
        {item.picture && <img src={item.picture} />}
        <div className="carousel-content">
          <h4>{item.title || ''}</h4>
          <p>{item.subtitle || ''}</p>
        </div>
        {renderActions(item.buttons)}
      </div>
    );
  };

  console.log(items);

  return (
    <div className="bot-message">
      <div className="carousel">{items.map(renderItem)}</div>
    </div>
  );
}
