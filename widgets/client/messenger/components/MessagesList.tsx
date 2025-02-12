import * as RTG from "react-transition-group";
import * as React from "react";
import * as classNames from "classnames";

import { IBotData, IMessage } from "../types";
import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IIntegrationUiOptions,
} from "../../types";
import { __, makeClickableLink, scrollTo } from "../../utils";
import { iconCall, iconVideo } from "../../icons/Icons";
import { useEffect, useRef, useState } from "react";

import AccquireInformation from "./AccquireInformation";
import Bot from "./bot/Bot";
import { MESSAGE_TYPES } from "../constants";
import Message from "./Message";
import MessageBot from "./MessageBot";
import { OPERATOR_STATUS } from "./bot/constants";
import { connection } from "../connection";
import { setLocalStorageItem } from "../../common";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
  uiOptions: IIntegrationUiOptions;
  messengerData: IIntegrationMessengerData;
  saveGetNotified: (
    doc: { type: string; value: string },
    callback?: () => void
  ) => void;
  isLoggedIn: () => boolean;
  getColor?: string;
  onSelectSkill: (skillId: string) => void;
  toggleVideoCall: () => void;
  replyAutoAnswer: (message: string, payload: string, type: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  conversationId: string | null;
  changeOperatorStatus: (_id: string, operatorStatus: string) => void;
  getBotInitialMessage: (callback: (bodData: any) => void) => void;
  operatorStatus?: string;
  sendMessage: (contentType: string, message: string) => void;
  showVideoCallRequest: boolean;
  botTyping?: boolean;
  selectedSkill?: string | null;
  errorMessage: string;
  isLoading: boolean;
};

const MessagesList: React.FC<Props> = (props) => {
  const {
    uiOptions,
    messengerData,
    messages,
    conversationId = "",
    getBotInitialMessage,
    saveGetNotified,
    onSelectSkill,
    isOnline,
    color,
    inputFocus,
    isLoggedIn,
    getColor,
    toggleVideoCall,
    replyAutoAnswer,
    sendTypingInfo,
    changeOperatorStatus,
    operatorStatus,
    sendMessage,
    showVideoCallRequest,
    botTyping,
    selectedSkill,
    errorMessage,
    isLoading,
  } = props;

  const backgroundClass = classNames("erxes-messages-background", {
    [`bg-${uiOptions.wallpaper}`]: uiOptions.wallpaper,
  });

  const nodeRef = useRef<HTMLDivElement>(null);
  const [hideNotifyInput, setHideNotifyInput] = useState(false);
  const [initialMessage, setInitialMessage] = useState<{
    botData: IBotData;
  } | null>(null);
  const [skillResponse, setSkillResponse] = useState<string | null>(null);
  const [shouldScrollBottom, setShouldScrollBottom] = useState(false);

  useEffect(() => {
    const newConversation =
      messages.length === 0 &&
      (!conversationId || (conversationId || "").length === 0);

    if (messengerData.botGreetMessage && newConversation) {
      getBotInitialMessage((initialMessage) => {
        setInitialMessage(initialMessage);
      });
    }
    const node = nodeRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
      makeClickableLink("#erxes-messages a");
    }
  }, []);

  useEffect(() => {
    const node = nodeRef.current;

    if (node) {
      const handleScroll = () => {
        setShouldScrollBottom(
          node.scrollHeight - (node.scrollTop + node.offsetHeight) < 20
        );
      };

      // Attach scroll event listener
      node.addEventListener("scroll", handleScroll);

      // Cleanup event listener on unmount
      return () => {
        node.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const node = nodeRef.current;

    if (node && shouldScrollBottom) {
      scrollTo(node, node.scrollHeight, 500);
    }
    makeClickableLink("#erxes-messages a");
  }, [messages, shouldScrollBottom]);

  const scrollBottom = () => {
    const node = nodeRef.current;

    if (node) {
      scrollTo(node, node.scrollHeight, 300);
    }
  };

  const onNotify = ({ type, value }: { type: string; value: string }) => {
    saveGetNotified({ type, value }, () => {
      setHideNotifyInput(true);
      setLocalStorageItem("hasNotified", "true");
    });
  };

  const handleSkillSelect = (skillId: string, response: string) => {
    setSkillResponse(response);
    onSelectSkill(skillId);
    inputFocus();
  };

  const renderBotGreetingMessage = (
    messengerData: IIntegrationMessengerData
  ) => {
    if (!messengerData.botGreetMessage) {
      return null;
    }

    return renderSingleMessage({
      content: messengerData.botGreetMessage,
      user: {},
    });
  };

  const renderAwayMessage = (messengerData: IIntegrationMessengerData) => {
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (isOnline || !messages.away) {
      return null;
    }

    return (
      <li className="erxes-spacial-message right away">{messages.away}</li>
    );
  };

  const renderNotifyInput = (messengerData: IIntegrationMessengerData) => {
    if (isLoggedIn()) {
      return null;
    }

    if (hideNotifyInput) {
      const messages =
        messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

      return (
        <li className="erxes-spacial-message with-background">
          <span> {messages.thank || __("Thank you") + "."}</span>
        </li>
      );
    }

    return (
      <li className="erxes-spacial-message with-background auth">
        <AccquireInformation
          save={onNotify}
          color={getColor}
          loading={false}
          textColor={uiOptions.textColor || "#fff"}
        />
      </li>
    );
  };
  const renderWelcomeMessage = (messengerData: IIntegrationMessengerData) => {
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (!isOnline || !messages.welcome) {
      return null;
    }

    return <li className="erxes-spacial-message right">{messages.welcome}</li>;
  };

  const renderSkillOptionsMessage = (
    messengerData: IIntegrationMessengerData
  ) => {
    const newConversation =
      messages.length === 0 &&
      (!conversationId || (conversationId || "").length === 0);

    if (!messengerData.skillData || !newConversation || selectedSkill) {
      return null;
    }

    const { options = [] } = messengerData.skillData;
    const { color, textColor = "#fff" } = uiOptions;

    if (options.length === 0) {
      return null;
    }

    return (
      <div className="skill-content">
        {options.map((option, index) => {
          const handleClick = () =>
            handleSkillSelect(option.skillId, option.response);

          return (
            <div key={index}>
              <div
                className="skill-card erxes-button"
                onClick={handleClick}
                style={{ background: color, color: textColor }}
              >
                {option.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSkillResponse = () => {
    if (!selectedSkill || !skillResponse) {
      return null;
    }

    return (
      <li className="from-customer">
        <div className="erxes-message from-customer gray">{skillResponse}</div>
      </li>
    );
  };

  const renderCallRequest = () => {
    if (!showVideoCallRequest || !connection.enabledServices.dailyco) {
      return null;
    }

    const sendCallRequest = () => {
      sendMessage(MESSAGE_TYPES.VIDEO_CALL_REQUEST, "");
    };

    const { color, textColor = "#fff" } = uiOptions;

    return (
      <div
        className="app-message-box call-request"
        style={{ borderColor: color }}
      >
        <h5>{__("Audio and video call")}</h5>
        <p>{__("You can contact the operator by voice or video!")}</p>
        <div className="call-buttons">
          <button
            className="erxes-button"
            style={{ background: color }}
            onClick={sendCallRequest}
          >
            {iconCall(textColor)}
            <span style={{ background: color, color: textColor }}>
              {__("Audio call")}
            </span>
          </button>
          <button
            className="erxes-button"
            style={{ background: color }}
            onClick={sendCallRequest}
          >
            {iconVideo(textColor)}
            <span style={{ color: textColor }}>Video call</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSingleMessage = (message: any) => {
    const { color, textColor = "#fff" } = uiOptions;
    const { botEndpointUrl } = messengerData;
    const _id: any = message._id;

    const messageProps = {
      color,
      textColor,
      toggleVideo: toggleVideoCall,
      sendTypingInfo,
      replyAutoAnswer,
      ...message,
    };

    const showBotMessage = message.botData && message.botData !== null;
    const content = showBotMessage ? (
      <MessageBot
        color={color}
        key={message._id}
        {...messageProps}
        scrollBottom={scrollBottom}
      />
    ) : (
      <Message key={message._id} {...messageProps} />
    );

    if (_id < 0) {
      return (
        <RTG.CSSTransition
          key={message._id}
          timeout={500}
          classNames="slide-in"
        >
          {content}
        </RTG.CSSTransition>
      );
    }

    return content;
  };

  const renderMessages = () => {
    return (
      <RTG.TransitionGroup component={null}>
        {messages.map(renderSingleMessage)}
      </RTG.TransitionGroup>
    );
  };

  const renderBotOperator = () => {
    if (
      !operatorStatus ||
      !conversationId ||
      operatorStatus === OPERATOR_STATUS.OPERATOR
    ) {
      return null;
    }

    return (
      <div className="bot-message">
        <div className="quick-replies">
          <div
            className="reply-button"
            onClick={handleOperatorStatus}
            style={{ borderColor: getColor }}
          >
            {__("Contact with Operator")}
          </div>
        </div>
      </div>
    );
  };

  const renderTyping = () => {
    if (!botTyping) {
      return null;
    }

    return (
      <li>
        <Bot />
        <div className="erxes-message top">
          <div className="bot-indicator">
            <span />
            <span />
            <span />
          </div>
        </div>
      </li>
    );
  };

  const renderErrorMessage = () => {
    if (!errorMessage) {
      return null;
    }

    return (
      <li className="from-customer">
        <div
          className="app-message-box spaced flexible"
          style={{ borderColor: "red" }}
        >
          <div className="user-info horizontal">{errorMessage}</div>
        </div>
      </li>
    );
  };

  const handleOperatorStatus = () => {
    if (!conversationId) {
      return;
    }

    return changeOperatorStatus(conversationId, OPERATOR_STATUS.OPERATOR);
  };

  return (
    <div className={backgroundClass} ref={nodeRef}>
      <ul id="erxes-messages" className="erxes-messages-list slide-in">
        {isLoading ? (
          <div className="loader" />
        ) : (
          <>
            {renderBotGreetingMessage(messengerData)}
            {renderWelcomeMessage(messengerData)}
            {renderSkillOptionsMessage(messengerData)}
            {renderSkillResponse()}
            {renderCallRequest()}
            {renderMessages()}
            {renderBotOperator()}
            {renderAwayMessage(messengerData)}
            {renderNotifyInput(messengerData)}
            {renderTyping()}
            {renderErrorMessage()}
          </>
        )}
      </ul>
    </div>
  );
};

export default MessagesList;
