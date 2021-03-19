import Button from 'erxes-ui/lib/components/Button';
import { __ } from 'modules/common/utils';
import { IMessagesItem } from 'modules/settings/integrations/types';
import React from 'react';
import {
  CallButtons,
  ErxesAvatar,
  ErxesDate,
  ErxesFromCustomer,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesSpacialMessage,
  FromCustomer,
  VideoCallRequestWrapper
} from './styles';

type Props = {
  color: string;
  textColor: string;
  wallpaper: string;
  isOnline?: boolean;
  showVideoCallRequest?: boolean;
  message?: IMessagesItem;
};

class WidgetContent extends React.Component<Props> {
  renderMessage = msg => {
    if (!msg) {
      return null;
    }

    return <ErxesSpacialMessage>{msg}</ErxesSpacialMessage>;
  };

  renderVideoCall() {
    const { showVideoCallRequest, color } = this.props;

    if (!showVideoCallRequest) {
      return null;
    }

    return (
      <VideoCallRequestWrapper color={color}>
        <h5>{__('Audio and video call')}</h5>
        <p>{__('You can contact the operator by voice or video!')}</p>
        <CallButtons color={color}>
          <Button uppercase={false} icon="phone-call">
            {__('Audio call')}
          </Button>
          <Button uppercase={false} icon="videocamera">
            {__('Video call')}
          </Button>
        </CallButtons>
      </VideoCallRequestWrapper>
    );
  }

  render() {
    const { color, wallpaper, message, isOnline, textColor } = this.props;

    const backgroundClasses = `background-${wallpaper}`;

    return (
      <>
        <ErxesMessagesList className={backgroundClasses}>
          {isOnline && this.renderMessage(message && message.welcome)}
          {this.renderVideoCall()}
          <li>
            <ErxesAvatar>
              <img src="/images/avatar-colored.svg" alt="avatar" />
            </ErxesAvatar>
            <ErxesMessage>{__('Hi, any questions?')}</ErxesMessage>
            <ErxesDate>{__('1 hour ago')}</ErxesDate>
          </li>
          <ErxesFromCustomer>
            <FromCustomer style={{ backgroundColor: color, color: textColor }}>
              {__('We need your help!')}
            </FromCustomer>
            <ErxesDate>{__('6 minutes ago')}</ErxesDate>
          </ErxesFromCustomer>
          {!isOnline && this.renderMessage(message && message.away)}
        </ErxesMessagesList>

        <ErxesMessageSender>
          <span>{__('Send a message')} ...</span>
        </ErxesMessageSender>
      </>
    );
  }
}

export default WidgetContent;
