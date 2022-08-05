import * as classNames from 'classnames';
import * as React from 'react';
import { IParticipator, IUser } from '../../types';
import { __ } from '../../utils';
import { MessageSender, MessagesList, TopBar } from '../containers';
import { IMessage } from '../types';
import ConversationHeadContent from './ConversationHeadContent';

type Props = {
  messages: IMessage[];
  goToConversationList: () => void;
  supporters: IUser[];
  participators: IParticipator[];
  operatorStatus?: string;
  isOnline: boolean;
  color?: string;
  loading?: boolean;
  refetchConversationDetail?: () => void;
  errorMessage: string;
  showTimezone?: boolean;
  serverTime?: string;
};

type State = {
  isFocused: boolean;
  expanded: boolean;
  isFullHead: boolean;
  isMinimizeVideoCall: boolean;
};

class ConversationDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isFocused: true,
      expanded: true,
      isFullHead: true,
      isMinimizeVideoCall: true
    };

    this.inputFocus = this.inputFocus.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggleHead = this.toggleHead.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  toggleHead() {
    this.setState({ isFullHead: !this.state.isFullHead });
  }

  toggleVideoCall = () => {
    this.setState({ isMinimizeVideoCall: !this.state.isMinimizeVideoCall });
  };

  toggleExpand() {
    this.setState({ expanded: !this.state.expanded });
  }

  inputFocus() {
    this.setState({ isFocused: true, isFullHead: false });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  onWheel(e: any) {
    if (e.nativeEvent.wheelDelta > 0) {
      if (!this.state.isFullHead) {
        this.setState({ isFullHead: true });
      }
    } else {
      if (this.state.isFullHead) {
        this.setState({ isFullHead: false });
      }
    }
  }

  render() {
    const {
      messages,
      participators,
      supporters,
      goToConversationList,
      refetchConversationDetail,
      operatorStatus,
      isOnline,
      color,
      loading,
      errorMessage,
      showTimezone,
      serverTime
    } = this.props;

    const rootClasses = classNames('erxes-content-wrapper', {
      'mini-video': this.state.isMinimizeVideoCall
    });

    const placeholder = !messages.length
      ? __('Send a message')
      : __('Write a reply');

    const handleLeftClick = (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      goToConversationList();

      // leave video call if you are in
      const videoIframe = document.getElementById('erxes-video-iframe');

      if (videoIframe) {
        videoIframe.remove();
      }
    };

    return (
      <div className="erxes-conversation-detail" onWheel={this.onWheel}>
        <TopBar
          middle={
            <ConversationHeadContent
              supporters={supporters}
              participators={participators}
              showTimezone={showTimezone}
              isOnline={isOnline}
              color={color}
              loading={loading}
              expanded={this.state.isFullHead}
              toggleExpand={this.toggleExpand}
              serverTime={serverTime}
            />
          }
          toggleHead={this.toggleHead}
          isExpanded={this.state.expanded}
          onLeftButtonClick={handleLeftClick}
        />

        <div className="erxes-conversation-content">
          <div id="page-root" className={rootClasses}>
            <MessagesList
              isOnline={isOnline}
              messages={messages}
              color={color}
              inputFocus={this.inputFocus}
              toggleVideoCall={this.toggleVideoCall}
              refetchConversationDetail={refetchConversationDetail}
              operatorStatus={operatorStatus}
              errorMessage={errorMessage}
            />

            <MessageSender
              placeholder={placeholder ? placeholder.toString() : ''}
              isParentFocused={this.state.isFocused}
              onTextInputBlur={this.onTextInputBlur}
              collapseHead={this.inputFocus}
              isOnline={isOnline}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ConversationDetail;
