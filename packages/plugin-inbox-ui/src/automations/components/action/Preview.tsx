import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import { __, readFile } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import Popover from "@erxes/ui/src/components/Popover";
import {
  CardContent,
  CardItem
} from "@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/bot/styles";
import { Row } from "@erxes/ui-settings/src/styles";
import { AvatarImg } from "@erxes/ui/src/components/filterableList/styles";
import styled from "styled-components";
import {
  CarouselButtonLeft,
  CarouselButtonRight,
  CarouselContainer,
  CarouselContent,
  EmulatorWrapper,
  QuickReplies,
  QuickReply
} from "../../styles";

const PopoverWrapper = (props) => {
  return <Popover {...props} />;
};

const Emulator = styled(PopoverWrapper)`
  height: 630px;
  width: 350px;
  border-radius: 50px;
  right: 550px;
  bottom: 140px;
  background-color: #232b39;
  border: 12px solid #181e28;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
  }

  .top-bar {
    width: 320px;
    display: flex;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 30px;
    position: fixed;

    .dynamic-island {
      height: 20px;
      width: 80px;
      border-radius: 15px;
      background-color: #181e28;
    }
  }
`;

const MesageRow = styled(Row)`
  align-items: end;
`;

const Message = styled(CardItem)`
  background-color: #2d3645;
  border: none;
  color: #ffffff;

  img {
    height: 100px;
    width: 100%;
    object-fit: cover;
  }
`;
const commonButtonStyle = `
  padding: 8px 16px;
  display: block;
  text-align: center;
  font-weight: 500;
  background-color: #414a59;
  margin: 10px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: #181e28;
  }
`;

const MessageLinkButton = styled.a`
  text-decoration: none;
  ${commonButtonStyle}
`;

const MessageButton = styled.div`
  ${commonButtonStyle}
`;

function Preview({ messages }) {
  const renderQuickReplies = ({ text, quickReplies }) => {
    return (
      <div>
        {renderCard({ text } as any)}
        <QuickReplies>
          {quickReplies.map((quickReply) => (
            <QuickReply>{quickReply.text}</QuickReply>
          ))}
        </QuickReplies>
      </div>
    );
  };

  const renderCard = (
    { buttons = [], text, title, subtitle, image },
    isCarousel?: boolean
  ) => {
    const renderButton = (button) => {
      const { type, text, link } = button;

      if (type === "link") {
        return (
          <MessageLinkButton
            target='_blank'
            href={link}>
            {text}
          </MessageLinkButton>
        );
      }

      return <MessageButton>{text}</MessageButton>;
    };

    const renderActions = (buttons?: any[]) => {
      if (!buttons || buttons.length === 0) {
        return null;
      }

      return (
        <div>
          {buttons.map((button, idx) => (
            <div key={idx}>{renderButton(button)}</div>
          ))}
        </div>
      );
    };

    return (
      <MesageRow>
        {!isCarousel && <AvatarImg src='/images/erxes-bot.svg' />}
        <Message>
          {image && (
            <img
              alt={image || ""}
              src={readFile(image)}
            />
          )}
          <CardContent>
            {text && <h4>{text}</h4>}
            {title && <h4>{title}</h4>}
            {subtitle && <p>{subtitle}</p>}
          </CardContent>
          {renderActions(buttons)}
        </Message>
      </MesageRow>
    );
  };

  const renderCards = (cards) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handlePrevClick = () => {
      setCurrentSlide((prevSlide) => (prevSlide > 0 ? prevSlide - 1 : 0));
    };

    const handleNextClick = () => {
      const totalSlides = cards.length;
      setCurrentSlide((prevSlide) =>
        prevSlide < totalSlides - 1 ? prevSlide + 1 : totalSlides - 1
      );
    };
    ``;

    return (
      <CarouselContainer>
        <MesageRow>
          <AvatarImg src='/images/erxes-bot.svg' />
          <CarouselButtonLeft onClick={handlePrevClick}>
            <Icon icon='angle-left' />
          </CarouselButtonLeft>
          <CarouselContent
            style={{ transform: `translateX(-${currentSlide * 50}%)` }}>
            {cards.map((card) => renderCard(card, true))}
          </CarouselContent>
          <CarouselButtonRight onClick={handleNextClick}>
            <Icon icon='angle-right-b' />
          </CarouselButtonRight>
        </MesageRow>
      </CarouselContainer>
    );
  };

  const renderMessage = (message) => {
    switch (message.type) {
      case "text":
        return renderCard(message);
      case "card":
        return renderCards(message.cards || []);
      case "image":
        return renderCard(message);
      case "quickReplies":
        return renderQuickReplies(message);
      default:
        return;
    }
  };

  return (
    <Emulator
      id='call-popover'
      className='call-popover'>
      <div className='top-bar'>
        <div className='dynamic-island' />
      </div>
      <EmulatorWrapper>
        {messages.map((message) => renderMessage(message))}
      </EmulatorWrapper>
    </Emulator>
  );
}

function PreviewWidget({ messages }) {
  return (
    <Popover
      trigger={
        <Button
          btnStyle='simple'
          icon='eye'
          block>
          {__("Preview")}
        </Button>
      }>
      <Preview messages={messages} />
    </Popover>
  );
}

export default PreviewWidget;
