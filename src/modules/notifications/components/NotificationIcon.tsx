import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { INotification } from 'modules/notifications/types';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
    (props.icon === 'piggy-bank' && colors.colorCoreBlue) ||
    (props.icon === 'creditcard' && colors.colorCoreTeal) ||
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
    const { notifType } = this.props.notification;
    let icon = 'users-alt';

    if (notifType.includes('conversation')) {
      icon = 'chat';
    }

    if (notifType.includes('deal')) {
      icon = 'piggy-bank';
    }

    if (notifType.includes('ticket')) {
      icon = 'creditcard';
    }

    if (notifType.includes('task')) {
      icon = 'clipboard';
    }

    return icon;
  }

  render() {
    return (
      <RoundedBackground icon={this.getIcon()}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default NotificationIcon;
