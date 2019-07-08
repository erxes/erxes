import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { INotification } from 'modules/notifications/types';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
// import { darken } from '../styles/color';

const RoundedBackground = styledTS<{ icon: string }>(styled.span)`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  text-align: center;
  display: flex;
  justify-content: center;
  border: 1px solid ${colors.colorWhite};
  background: ${props =>
    (props.icon === 'chat' && colors.colorPrimary) ||
    (props.icon === 'piggy-bank' && colors.colorCoreTeal) ||
    (props.icon === 'creditcard' && colors.colorLightBlue) ||
    (props.icon === 'clipboard' && colors.colorCoreRed) ||
    colors.colorCoreGreen};

  i {
    color: ${colors.colorWhite};
    font-size: 9px;
    line-height: 15px;
  }
`;

type Props = {
  notification: INotification;
};

class NotificationIcon extends React.PureComponent<Props> {
  getIcon() {
    const { notification } = this.props;
    let icon = 'repeat-1';

    if (notification.notifType.includes('conversation')) {
      icon = 'chat';
    }

    if (notification.notifType.includes('deal')) {
      icon = 'piggy-bank';
    }

    if (notification.notifType.includes('ticket')) {
      icon = 'creditcard';
    }

    if (notification.notifType.includes('task')) {
      icon = 'clipboard';
    }

    return icon;
  }

  render() {
    const { notification } = this.props;

    return (
      <RoundedBackground icon={this.getIcon()}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default NotificationIcon;
