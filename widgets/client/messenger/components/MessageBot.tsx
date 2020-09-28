import classNames = require("classnames");
import * as dayjs from "dayjs";
import * as React from "react";
import * as xss from "xss";
import { IUser } from "../../types";
import { __, urlify } from "../../utils";
import { IBotData } from "../types";
import Bot from "./botpress/Bot";
import Carousel from "./botpress/Carousel";
import CustomMessage from "./botpress/CustomMessage";

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

function MessengeBot(props: Props) {
  const {
    conversationId,
    user,
    color,
    textColor,
    createdAt,
    botData,
    isBotMessage,
    replyAutoAnswer,
    sendTypingInfo,
  } = props;

  function renderBotMessage() {
    const { type, text, elements, url } = botData;

    const commonProps = {
      conversationId,
      replyAutoAnswer,
      sendTypingInfo,
    };

    switch (type) {
      case "text":
        return (
          <span dangerouslySetInnerHTML={{ __html: xss(urlify(text || "")) }} />
        );
      case "file":
        return <img src={url} style={{ width: 200, height: 200 }} />;
      case "carousel":
        return <Carousel items={elements} {...commonProps} />;
      case "custom":
        return <CustomMessage message={botData} {...commonProps} />;
      default:
        return null;
    }
  }

  function renderContent() {
    const messageClasses = classNames("erxes-message", {
      "from-customer": !isBotMessage,
    });

    const messageBackground = {
      backgroundColor: !user ? color : "",
      color: !user ? textColor : "",
    };

    return (
      <div style={messageBackground} className={messageClasses}>
        {renderBotMessage()}
      </div>
    );
  }

  function renderDate() {
    return (
      <div className="date">
        <span
          className="erxes-tooltip"
          data-tooltip={dayjs(createdAt).format("YYYY-MM-DD, HH:mm:ss")}
        >
          {dayjs(createdAt).format("LT")}
        </span>
      </div>
    );
  }

  return (
    <li className={classNames({ "from-customer": !isBotMessage })}>
      {isBotMessage ? <Bot /> : null}
      {renderContent()}
      {renderDate()}
    </li>
  );
}

export default MessengeBot;
