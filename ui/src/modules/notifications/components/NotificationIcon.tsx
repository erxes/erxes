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
  background: ${props =>
    (props.icon === 'comment-1' && colors.colorCoreBlue) ||
    (props.icon === 'dollar-alt' && colors.colorCoreRed) ||
    (props.icon === 'postcard' && '#3a6f81') ||
    (props.icon === 'file-check' && '#34c1c6') ||
    '#8c7ae6'};

  i {
    color: ${colors.colorWhite};
    font-size: 10px;
    line-height: 18px;
  }
`;

type Props = {
  notification: INotification;
};

class NotificationIcon extends React.PureComponent<Props> {
  getIcon() {
    const { notifType } = this.props.notification;
    let icon = 'user-check';

    if (notifType.includes('conversation')) {
      icon = 'comment-1';
    }

    if (notifType.includes('deal')) {
      icon = 'dollar-alt';
    }

    if (notifType.includes('ticket')) {
      icon = 'postcard';
    }

    if (notifType.includes('task')) {
      icon = 'file-check';
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
