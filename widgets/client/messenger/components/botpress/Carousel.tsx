import * as React from "react";
import { BUTTON_TYPES } from "./constants";

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
        <div>
          <p>{title}</p>
          <button
            onClick={handleClick}
            style={{ padding: 10, backgroundColor: "teal" }}
          >
            {text}
          </button>
        </div>
      );
    }

    if (type === BUTTON_TYPES.openUrl) {
      return <a href={url}>{title}</a>;
    }

    const handlePostBack = () => replyAutoAnswer(title, payload);

    return (
      <button
        onClick={handlePostBack}
        style={{ padding: 10, backgroundColor: "teal" }}
      >
        {button.title}
      </button>
    );
  }

  function renderActions(buttons?: CarouselButton[]) {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    return (
      <div style={{ display: "inline-block" }}>
        {buttons.map((button, idx) => (
          <div key={idx}>{renderButton(button)}</div>
        ))}
      </div>
    );
  }

  const renderItem = (item: ICarouselItem, index: number) => {
    return (
      <div key={index}>
        <img src={item.picture} style={{ width: 200, height: 200 }} />
        <h4>{item.title || ""}</h4>
        <h6>{item.subtitle || ""}</h6>
        {renderActions(item.buttons)}
      </div>
    );
  };

  return <div>{items.map(renderItem)}</div>;
}
