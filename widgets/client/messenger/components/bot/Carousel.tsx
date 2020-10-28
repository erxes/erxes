import * as classNames from 'classnames';
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
  replyAutoAnswer: (message: string, payload: string, type: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  scrollBottom: () => void;
  color?: string;
};

type State = {
  active: number;
};

export default class Carousel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { active: 0 };
  }

  renderButton(button: CarouselButton) {
    const { type, title, text, url, payload } = button;
    const { replyAutoAnswer, scrollBottom } = this.props;

    if (type === BUTTON_TYPES.openUrl) {
      return (
        <a className="card-action" target="_blank" href={url}>
          {title}
        </a>
      );
    }

    const handleClick = () => {
      replyAutoAnswer(
        title,
        type === BUTTON_TYPES.saySomething ? text : payload,
        type
      );
      scrollBottom();
    };

    return (
      <div onClick={handleClick} className="card-action">
        {title}
      </div>
    );
  }

  renderActions = (buttons?: CarouselButton[]) => {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    return (
      <div className="card-actions">
        {buttons.map((button, idx) => (
          <div key={idx}>{this.renderButton(button)}</div>
        ))}
      </div>
    );
  };

  renderItem = (item: ICarouselItem, index: number) => {
    const itemClasses = classNames('card-item', {
      active: index === this.state.active
    });
    const onClick = () => this.onCardClick(index);

    return (
      <div className={itemClasses} key={index} onClick={onClick}>
        {item.picture && (
          <img src={item.picture} onLoad={this.props.scrollBottom} />
        )}
        <div className="card-content">
          {item.title && <h4>{item.title}</h4>}
          {item.subtitle && <p>{item.subtitle}</p>}
        </div>
        {this.renderActions(item.buttons)}
      </div>
    );
  };

  onCardClick = (active: number) => {
    this.setState({ active });
  };

  renderNext = (hide: boolean, color: string) => {
    if (hide) {
      return;
    }

    const onNext = () => this.onCardClick(this.state.active + 1);

    return (
      <div className="arrow next" onClick={onNext}>
        <svg
          width="8"
          height="12"
          viewBox="0 0 8 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill={color}
            d="M0 10.59L4.94467 6L0 1.41L1.52227 0L8 6L1.52227 12L0 10.59Z"
          />
        </svg>
      </div>
    );
  };

  renderPrev = (hide: boolean, color: string) => {
    if (hide) {
      return;
    }

    const onPrev = () => this.onCardClick(this.state.active - 1);

    return (
      <div className="arrow prev" onClick={onPrev}>
        <svg
          width="8"
          height="12"
          viewBox="0 0 8 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill={color}
            d="M8 1.41L3.05533 6L8 10.59L6.47773 12L0 6L6.47773 0L8 1.41Z"
          />
        </svg>
      </div>
    );
  };

  render() {
    const { items, color = '#673fbd' } = this.props;

    if (!items || items.length === 0) {
      return null;
    }

    const { active } = this.state;

    /**
     * 240 - card width
     * active - active page index
     * 15 - card gap
     * 2 - border-width
     */
    const width = active * 240 + active * 17;

    return (
      <div className="bot-message">
        <div className="cards-wrapper">
          <div className="cards-navigation">
            {this.renderPrev(active === 0, color)}
            {this.renderNext(active === items.length - 1, color)}
          </div>
          <div
            className="cards"
            style={{
              transform: `translateX(-${width}px)`
            }}
          >
            {items.map(this.renderItem)}
          </div>
        </div>
      </div>
    );
  }
}
