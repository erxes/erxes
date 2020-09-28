import { ICarouselButton, ICarouselItem } from 'modules/inbox/types';
import * as React from 'react';

type Props = {
  items?: ICarouselItem[];
};

export default function Carousel({ items }: Props) {
  if (!items || items.length === 0) {
    return null;
  }

  function renderButton(button: ICarouselButton) {
    const { type, title, text, url } = button;

    if (type === 'saySomething') {
      return (
        <div>
          <p>{title}</p>
          <button style={{ padding: 10, backgroundColor: 'teal' }}>
            {text}
          </button>
        </div>
      );
    }

    if (type === 'openUrl') {
      return <a href={url}>{title}</a>;
    }

    return (
      <button style={{ padding: 10, backgroundColor: 'teal' }}>
        {button.title}
      </button>
    );
  }

  function renderActions(buttons?: ICarouselButton[]) {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    return (
      <div style={{ display: 'inline-block' }}>
        {buttons.map((button, idx) => (
          <div key={idx}>{renderButton(button)}</div>
        ))}
      </div>
    );
  }

  const renderItem = (item: ICarouselItem, index: number) => {
    return (
      <div key={index}>
        <img
          src={item.picture}
          alt={item.title}
          style={{ width: 200, height: 200 }}
        />
        <h4>{item.title || ''}</h4>
        <h6>{item.subtitle || ''}</h6>
        {renderActions(item.buttons)}
      </div>
    );
  };

  return <div>{items.map(renderItem)}</div>;
}
