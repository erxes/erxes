import client from 'apolloClient';
import gql from 'graphql-tag';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from 'modules/common/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { INotification } from '../types';
import NotificationsLatest from './NotificationsLatest';
import { NotifButton } from './styles';
import { mutations } from '../graphql';
import { IUser } from 'modules/auth/types';

type Props = {
  unreadCount: number;
  notifications: INotification[];
  showNotifications: (requireRead: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  isLoading: boolean;
  currentUser?: IUser;
};

type State = {
  currentTab: string;
};

class Widget extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Recent'
    };
  }

  onHideNumber = () => {
    client.mutate({
      mutation: gql(mutations.showNotification)
    });
  };

  renderUnreadCount() {
    const { unreadCount, currentUser } = this.props;
    const user = currentUser || { isShowNotification: false };

    if (!user.isShowNotification && unreadCount && unreadCount !== 0) {
      return (
        <Label shake={true} lblStyle="danger" ignoreTrans={true}>
          {unreadCount}
        </Label>
      );
    }

    return null;
  }

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  render() {
    const {
      notifications,
      isLoading,
      showNotifications,
      markAsRead
    } = this.props;

    const { currentTab } = this.state;

    const popoverProps = {
      notifications,
      isLoading,
      markAsRead
    };

    const recentOnClick = () => {
      this.onTabClick('Recent');
      showNotifications(false);
    };

    const unreadOnClick = () => {
      this.onTabClick('Unread');
      showNotifications(true);
    };

    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'Recent' ? 'active' : ''}
            onClick={recentOnClick}
          >
            {__('Recent')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Unread' ? 'active' : ''}
            onClick={unreadOnClick}
          >
            {__('Unread')}
          </TabTitle>
        </Tabs>
        <NotificationsLatest {...popoverProps} />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={popoverNotification}
      >
        <NotifButton>
          <Icon icon="bell" size={20} onClick={this.onHideNumber} />
          {this.renderUnreadCount()}
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;
