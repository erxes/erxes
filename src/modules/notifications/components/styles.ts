import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const NotificationWrapper = styled.div`
  position: relative;
  padding-bottom: 30px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const NotificationSeeAll = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid ${colors.borderPrimary};
  height: 30px;

  a {
    padding: 5px ${dimensions.coreSpacing}px;
    display: block;
    text-align: center;
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

    &:last-child {
      border: none;
    }

    &.unread {
      background: ${colors.bgUnread};
    }

    &:hover,
    &:focus {
      background: ${colors.bgLight};
      cursor: pointer;
    }
  }
`;

const NotificationList = styled(NotifList)`
  max-height: 420px !important;

  li {
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  }
`;

const NotifButton = styled.div`
  cursor: pointer;
  text-align: center;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;

  &[aria-describedby] {
    color: ${colors.colorSecondary};
  }

  i {
    font-size: 18px;
  }

  span {
    position: absolute;
    top: -4px;
    right: -10px;
    padding: 4px;
    min-width: 18px;
    min-height: 18px;
  }
`;

const PopoverHeader = styled.div`
  padding: ${dimensions.coreSpacing / 2}px ${dimensions.coreSpacing}px;
`;

const PopoverContent = styled.div`
  padding-bottom: 40px;
  height: 420px;
`;

const CreatedUser = styled.span`
  font-weight: 600;
  padding-left: ${dimensions.unitSpacing}px;

  span {
    padding-left: ${dimensions.unitSpacing - 5}px;
    font-weight: normal;
  }
`;

const CreatedDate = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  text-align: right;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Content = styled.div`
  background: ${colors.bgMain};
  padding: 5px ${dimensions.unitSpacing}px;
  border-radius: 3px;

  > p {
    margin: 0;
  }
`;

export {
  NotifList,
  NotificationList,
  NotificationWrapper,
  NotificationSeeAll,
  NotifButton,
  PopoverHeader,
  PopoverContent,
  CreatedUser,
  FlexRow,
  CreatedDate,
  Content
};
