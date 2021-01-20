import { colors, dimensions } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

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
    text-align: left;
  }
`;

const MarkAllRead = styled.a`
  position: relative;
  cursor: pointer;
  padding: 5px ${dimensions.coreSpacing}px;
  float: right;
`;

const AvatarSection = styled.div`
  margin-right: ${dimensions.unitSpacing + 5}px;
  position: relative;
`;

const Content = styled.div`
  background: ${colors.bgMain};
  padding: ${dimensions.unitSpacing - 5}px ${dimensions.unitSpacing}px;
  border-radius: 3px;
  margin: ${dimensions.unitSpacing - 5}px 0;
  display: inline-block;

  > p {
    margin: 0;
  }
`;

const NotifList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
    border-bottom: 1px solid ${colors.bgActive};
    position: relative;
    display: flex;

    &:last-child {
      border: none;
    }

    &.unread {
      background: #edf2fa;
      border-color: #e3e9f3;

      ${Content} {
        background: ${colors.colorWhite};
      }
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
  overflow: auto;
`;

const NotifButton = styled.div`
  cursor: pointer;
  text-align: center;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  color: ${colors.textSecondary};

  span {
    position: absolute;
    top: -4px;
    right: -8px;
    padding: 3px;
    min-width: 18px;
    min-height: 18px;
    line-height: 12px;
  }
`;

const PopoverHeader = styled.div`
  padding: ${dimensions.coreSpacing / 2}px ${dimensions.coreSpacing}px;
`;

const PopoverLink = styled.a`
  cursor: pointer;
  span {
    padding-right: 5px;
  }
`;

const PopoverContent = styled.div`
  padding: 20px;
`;

const CreatedUser = styledTS<{ isList?: boolean }>(styled.div)`
  font-weight: 600;
  max-width: ${props => props.isList && '80%'};

  span {
    padding-left: ${dimensions.unitSpacing - 5}px;
    font-weight: normal;
  }
`;

const CreatedDate = styledTS<{ isList?: boolean }>(styled.div)`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  padding-top: 3px;

  ${props =>
    props.isList &&
    css`
      position: absolute;
      right: 0;
      top: 5px;
    `}
`;

const InfoSection = styled.div`
  position: relative;
  flex: 1;
`;

const Item = styledTS<{ background?: string }>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  border-radius: 10px;
  color: ${colors.colorWhite};
  background: ${props => props.background || colors.colorCoreBlue};
  max-width: 300px;
  box-shadow: 0 0 15px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  position: relative;
  display: flex;

  > span {
    margin-right: 10px;
  }

  a {
    color: ${colors.colorWhite};
    text-decoration: underline;
  }

  h3 {
    margin-top: 0;
    font-size: 14px;
  }

  p {
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
  CreatedUser,
  CreatedDate,
  Content,
  AvatarSection,
  InfoSection,
  PopoverContent,
  Item,
  PopoverLink,
  MarkAllRead
};
