import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover, Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { Icon } from 'modules/common/components';
import { NotificationsLatest } from '../containers';

const ActionButton = styled.div`
  color: #383838;
  font-size: 22px;
  cursor: pointer;
  position: relative;

  & .badge {
    position: absolute;
    top: 0;
    right: -9px;
    font-size: 10px;
    background-color: #f74040;
    padding: 3px 5px;
  }
`;

const Widget = ({ unreadCount }) => {
  const popoverNotification = (
    <Popover
      id="npopover"
      className="notification-popover"
      title="Notifications"
    >
      <NotificationsLatest />
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="bottom"
      containerPadding={15}
      overlay={popoverNotification}
    >
      <ActionButton>
        <Icon icon="android-notifications" />
        <Badge>{unreadCount !== 0 ? unreadCount : null}</Badge>
      </ActionButton>
    </OverlayTrigger>
  );
};

Widget.propTypes = {
  unreadCount: PropTypes.number
};

export default Widget;
