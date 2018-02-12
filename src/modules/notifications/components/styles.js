import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const NotificationWrapper = styled.div`
  position: relative;
  padding-bottom: 30px;
`;

const NotificationArea = styled.div`
  max-height: 300px !important;
`;

const NotificationSeeAll = styled.div`
  a {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 5px 20px;
    display: block;
    text-align: center;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

const NotificationPopover = styled.div`
  right: 15px;
  max-width: 360px;
`;

const MarkRead = styled.div`
  visibility: hidden;

  span:hover {
    cursor: pointer;
  }
`;

const NotifBody = styled.div`
  flex: 1;

  &:hover {
    cursor: pointer;
  }
`;

const NotifList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: ${dimensions.coreSpacing}px;
    border-bottom: 1px solid ${colors.bgActive};
    position: relative;
    display: flex;
    align-items: center;

    &.unread {
      background: ${colors.bgUnread};

      ${MarkRead} {
        visibility: visible;
      }
    }
  }
`;

const NotificationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    padding: 0 !important;
    border-bottom: 1px solid ${colors.bgActive};

    &:last-child {
      border: 0;
    }

    > div {
      display: block;
      padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
      color: ${colors.darkShadow};
    }

    &.unread {
      background: ${colors.bgUnread};
    }

    &:hover {
      background: ${colors.bgLight};
      cursor: pointer;
    }

    &:focus {
      background: ${colors.bgLight};
      cursor: pointer;
    }
  }
`;

const NotifButton = styled.div`
  font-size: 22px;
  cursor: pointer;
  position: relative;

  & .badge {
    position: absolute;
    top: 0;
    right: -9px;
    font-size: ${dimensions.unitSpacing}px;
    background-color: ${colors.colorCoreRed};
    padding: 3px 5px;
    min-width: 16px;
  }
`;

export {
  NotificationPopover,
  NotifList,
  NotificationArea,
  NotificationList,
  NotificationWrapper,
  NotificationSeeAll,
  NotifButton,
  MarkRead,
  NotifBody
};
