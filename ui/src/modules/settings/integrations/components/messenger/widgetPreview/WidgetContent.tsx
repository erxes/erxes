import { __ } from 'modules/common/utils';
import { IMessagesItem } from 'modules/settings/integrations/types';
import React from 'react';
import {
  ErxesAvatar,
  ErxesDate,
  ErxesFromCustomer,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesSpacialMessage,
  FromCustomer
} from './styles';

type Props = {
  color: string;
  textColor: string;
  wallpaper: string;
  isOnline?: boolean;
  message?: IMessagesItem;
};

class WidgetContent extends React.Component<Props> {
  renderMessage = msg => {
    if (!msg) {
      return null;
    }

    return <ErxesSpacialMessage>{msg}</ErxesSpacialMessage>;
  };

  render() {
    const { color, wallpaper, message, isOnline, textColor } = this.props;

    const backgroundClasses = `background-${wallpaper}`;

    return (
      <>
        <ErxesMessagesList className={backgroundClasses}>
          {isOnline && this.renderMessage(message && message.welcome)}
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
