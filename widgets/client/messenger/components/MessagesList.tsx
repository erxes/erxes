import * as classNames from 'classnames';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { setLocalStorageItem } from '../../common';
import { iconCall, iconVideo } from '../../icons/Icons';
import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IIntegrationUiOptions
} from '../../types';
import { __, makeClickableLink, scrollTo } from '../../utils';
import { MESSAGE_TYPES } from '../containers/AppContext';
import { IBotData, IMessage } from '../types';
import Message from './Message';
import MessageBot from './MessageBot';
import AccquireInformation from './AccquireInformation';
import Bot from './bot/Bot';
import { OPERATOR_STATUS } from './bot/constants';
import { connection } from '../connection';

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
};

type State = {
  hideNotifyInput: boolean;
  initialMessage: { botData: IBotData } | null;
  skillResponse: string | null;
};

class MessagesList extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;
  private shouldScrollBottom: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      hideNotifyInput: false,
      initialMessage: null,
      skillResponse: null
    };

    this.onNotify = this.onNotify.bind(this);
  }

  componentDidMount() {
    const {
      messengerData,
      messages,
      conversationId = '',
      getBotInitialMessage
    } = this.props;

    const newConversation =
      messages.length === 0 &&
      (!conversationId || (conversationId || '').length === 0);

    if (messengerData.botShowInitialMessage && newConversation) {
      getBotInitialMessage(initialMessage => {
        this.setState({ initialMessage });
      });
    }

    if (this.node) {
      this.node.scrollTop = this.node.scrollHeight;
      makeClickableLink('#erxes-messages a');
    }
  }

  componentWillUpdate() {
    const node = this.node;

    if (node) {
      this.shouldScrollBottom =
        node.scrollHeight - (node.scrollTop + node.offsetHeight) < 20;
    }
  }

  scrollBottom = () => {
    if (this.node) {
      scrollTo(this.node, this.node.scrollHeight, 300);
    }
  };

  componentDidUpdate(prevProps: any) {
    if (prevProps.messages !== this.props.messages) {
      if (this.node && this.shouldScrollBottom) {
        scrollTo(this.node, this.node.scrollHeight, 500);
      }
      makeClickableLink('#erxes-messages a');
    }
  }

  onNotify = ({ type, value }: { type: string; value: string }) => {
    this.props.saveGetNotified({ type, value }, () => {
      this.setState({ hideNotifyInput: true }, () =>
        setLocalStorageItem('hasNotified', 'true')
      );
    });
  };

  handleSkillSelect(skillId: string, response: string) {
    this.setState({ skillResponse: response });
    this.props.onSelectSkill(skillId);
    this.props.inputFocus();
  }

  renderBotGreetingMessage(messengerData: IIntegrationMessengerData) {
    const { initialMessage } = this.state;

    if (!messengerData.botShowInitialMessage || !initialMessage) {
      return null;
    }

    return this.renderSingleMessage(initialMessage);
  }

  renderAwayMessage(messengerData: IIntegrationMessengerData) {
    const { isOnline } = this.props;
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (isOnline || !messages.away) {
      return null;
    }

    return (
      <li className="erxes-spacial-message right away">{messages.away}</li>
    );
  }

  renderNotifyInput(messengerData: IIntegrationMessengerData) {
    const { isLoggedIn, getColor, uiOptions } = this.props;

    if (isLoggedIn()) {
      return null;
    }

    if (this.state.hideNotifyInput) {
      const messages =
        messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

      return (
        <li className="erxes-spacial-message with-background">
          <span> {messages.thank || __('Thank you') + '.'}</span>
        </li>
      );
    }

    return (
      <li className="erxes-spacial-message with-background auth">
        <AccquireInformation
          save={this.onNotify}
          color={getColor}
          loading={false}
          textColor={uiOptions.textColor || '#fff'}
        />
      </li>
    );
  }

  renderWelcomeMessage(messengerData: IIntegrationMessengerData) {
    const { isOnline } = this.props;
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (!isOnline || !messages.welcome) {
      return null;
    }

    return <li className="erxes-spacial-message right">{messages.welcome}</li>;
  }

  renderSkillOptionsMessage(messengerData: IIntegrationMessengerData) {
    const { conversationId, messages } = this.props;

    const newConversation =
      messages.length === 0 &&
      (!conversationId || (conversationId || '').length === 0);

    if (
      !messengerData.skillData ||
      !newConversation ||
      this.props.selectedSkill
    ) {
      return null;
    }

    const { options = [] } = messengerData.skillData;
    const { uiOptions } = this.props;
    const { color, textColor = '#fff' } = uiOptions;

    if (options.length === 0) {
      return null;
    }

    return (
      <div className="skill-content">
        {options.map((option, index) => {
          const handleClick = () =>
            this.handleSkillSelect(option.skillId, option.response);

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
  }

  renderSkillResponse = () => {
    if (!this.props.selectedSkill || !this.state.skillResponse) {
      return null;
    }

    return (
      <li className="from-customer">
        <div className="erxes-message from-customer gray">
          {this.state.skillResponse}
        </div>
      </li>
    );
  };

  renderCallRequest() {
    if (!this.props.showVideoCallRequest || !connection.enabledServices.dailyco) {
      return null;
    }

    const sendCallRequest = () => {
      this.props.sendMessage(MESSAGE_TYPES.VIDEO_CALL_REQUEST, '');
    };

    const { uiOptions } = this.props;
    const { color, textColor = '#fff' } = uiOptions;

    return (
      <div
        className="app-message-box call-request"
        style={{ borderColor: color }}
      >
        <h5>{__('Audio and video call')}</h5>
        <p>{__('You can contact the operator by voice or video!')}</p>
        <div className="call-buttons">
          <button
            className="erxes-button"
            style={{ background: color }}
            onClick={sendCallRequest}
          >
            {iconCall(textColor)}
            <span style={{ background: color, color: textColor }}>
              {__('Audio call')}
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
  }

  renderSingleMessage = (message: any) => {
    const {
      replyAutoAnswer,
      sendTypingInfo,
      uiOptions,
      messengerData
    } = this.props;

    const { color, textColor = '#fff' } = uiOptions;
    const { botEndpointUrl } = messengerData;
    const _id: any = message._id;

    const messageProps = {
      color,
      textColor,
      toggleVideo: this.props.toggleVideoCall,
      sendTypingInfo,
      replyAutoAnswer,
      ...message
    };

    const showBotMessage = botEndpointUrl && message.botData !== null;

    const content = showBotMessage ? (
      <MessageBot
        color={color}
        key={message._id}
        {...messageProps}
        scrollBottom={this.scrollBottom}
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

  renderMessages() {
    return (
      <RTG.TransitionGroup component={null}>
        {this.props.messages.map(this.renderSingleMessage)}
      </RTG.TransitionGroup>
    );
  }

  renderBotOperator() {
    const { operatorStatus, conversationId, getColor } = this.props;

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
            onClick={this.handleOperatorStatus}
            style={{ borderColor: getColor }}
          >
            {__('Contact with Operator')}
          </div>
        </div>
      </div>
    );
  }

  renderTyping() {
    const { botTyping } = this.props;

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
  }

  renderErrorMessage() {
    const { errorMessage } = this.props;

    if (!errorMessage) {
      return null;
    }

    return (
      <li className="from-customer">
        <div
          className="app-message-box spaced flexible"
          style={{ borderColor: 'red' }}
        >
          <div className="user-info horizontal">{errorMessage}</div>
        </div>
      </li>
    );
  }

  handleOperatorStatus = () => {
    const { conversationId, changeOperatorStatus } = this.props;

    if (!conversationId) {
      return;
    }

    return changeOperatorStatus(conversationId, OPERATOR_STATUS.OPERATOR);
  };

  render() {
    const { uiOptions, messengerData } = this.props;
    const backgroundClass = classNames('erxes-messages-background', {
      [`bg-${uiOptions.wallpaper}`]: uiOptions.wallpaper
    });

    return (
      <div className={backgroundClass} ref={node => (this.node = node)}>
        <ul id="erxes-messages" className="erxes-messages-list slide-in">
          {this.renderBotGreetingMessage(messengerData)}
          {this.renderWelcomeMessage(messengerData)}
          {this.renderSkillOptionsMessage(messengerData)}
          {this.renderSkillResponse()}
          {this.renderCallRequest()}
          {this.renderMessages()}
          {this.renderBotOperator()}
          {this.renderAwayMessage(messengerData)}
          {this.renderNotifyInput(messengerData)}
          {this.renderTyping()}
          {this.renderErrorMessage()}
        </ul>
      </div>
    );
  }
}

export default MessagesList;
