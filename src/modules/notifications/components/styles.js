import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const NotificationWrapper = styled.div`
  position: relative;
  padding-bottom: 30px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const NotificationArea = styled.div`
  max-height: 420px !important;
`;

const NotificationSeeAll = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid ${colors.borderPrimary};
  height: 30px;

  a {
    padding: 5px 20px;
    display: block;
    text-align: center;
  }
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
  max-height: 420px !important;

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
  position: absolute;
  padding: 15px 20px 20px;
  bottom: 0;
  cursor: pointer;
  text-align: center;
  width: 100%;
  transition: all 0.3s ease;

  &[aria-describedby] {
    background: rgba(0, 0, 0, 0.13);
  }

  img {
    width: 20px;
  }

  span {
    position: absolute;
    top: 6px;
    right: 11px;
    padding: 4px;
    min-width: 19px;
    min-height: 19px;
  }
`;

const toggleSize = 32;

const PopoverHeader = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const PopoverContent = styled.div`
  padding-bottom: 40px;
  height: 450px;
`;

const Toggler = styled.div`
  display: flex;
  height: ${toggleSize}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${toggleSize / 2}px;
  position: relative;
  color: ${colors.colorCoreGray};
  z-index: 1;
  cursor: pointer;

  &:before {
    content: '';
    position: absolute;
    top: -1px;
    height: ${toggleSize}px;
    width: 50%;
    z-index: 3;
    border-radius: ${toggleSize / 2}px;
    transition: all 0.3s ease;
    background: ${colors.colorPrimary};
    left: ${props => (props.activeFirst ? '-1px' : 'calc(50% + 1px)')};
    box-shadow: 0 0 20px 2px ${rgba(colors.colorPrimary, 0.4)};
  }
`;

const Toggle = styled.div`
  flex: 1;
  text-align: center;
  line-height: ${toggleSize - 2}px;
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 10px;
  z-index: 4;
  color: ${props => (props.isActive ? colors.colorWhite : 'inherit')};

  i {
    font-size: 14px;
    margin-right: 10px;
  }
`;

const NotifCount = styled.div`
  position: relative;

  span {
    position: absolute;
    top: 3px;
    right: 2px;
    padding: 2px 3px;
    min-width: 12px;
    min-height: 12px;
    font-size: 7px;
  }
`;

export {
  NotifList,
  NotificationArea,
  NotificationList,
  NotificationWrapper,
  NotificationSeeAll,
  NotifButton,
  MarkRead,
  NotifBody,
  PopoverHeader,
  PopoverContent,
  Toggler,
  Toggle,
  NotifCount
};
