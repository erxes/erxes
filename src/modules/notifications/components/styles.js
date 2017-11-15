import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

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
    border-top: 1px solid $border-grey;
  }
`;

const NotificationWrapper = styled.div`
  position: relative;
  padding-bottom: 30px;

  & .empty-state.small {
    padding-top: 30px;
  }
`;

const NotificationPopover = styled.div`
  right: 15px;
  max-width: 360px;
`;

const NotifList = styled.ul`
  li {
    .column {
      visibility: hidden;
    }

    &.unread .column {
      visibility: visible;
    }

    & .body:hover {
      cursor: pointer;
    }
  }

  .text {
    .second-line {
      margin-top: 3px;
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

  .text {
    a.first-line {
      margin-top: 0;
      white-space: normal;
      font-weight: 500;
      font-size: 13px;
    }

    .second-line {
      font-size: 12px;
      margin-top: 3px;
    }
  }
`;

export {
  NotificationPopover,
  NotifList,
  NotificationArea,
  NotificationList,
  NotificationWrapper,
  NotificationSeeAll
};
