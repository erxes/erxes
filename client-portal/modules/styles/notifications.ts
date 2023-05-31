import { colors, dimensions, typography } from '.';
import styled from 'styled-components';
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

  font-size: 13px !important;
  color: rgb(23, 133, 252) !important;

  a {
    padding: 5px ${dimensions.coreSpacing}px;
    display: block;
    text-align: left;
  }
`;

const MarkAllRead = styled.a`
  position: relative;
  cursor: pointer;

  font-size: 13px !important;
  color: rgb(23, 133, 252) !important;

  padding: 5px ${dimensions.coreSpacing}px;
  float: right;
`;

const CreatedUser = styledTS<{ isList?: boolean }>(styled.div)`
  font-weight: 600;
  max-width: ${props => props.isList && '80%'};

  span {
    padding-left: ${dimensions.unitSpacing - 5}px;
    font-weight: normal;
  }
`;

const AvatarSection = styled.div`
  margin-right: ${dimensions.unitSpacing + 5}px;
  position: relative;
`;

const TabContainer = styledTS<{ grayBorder?: boolean; full?: boolean }>(
  styled.div
)`
  border-bottom: 1px solid
    ${props => (props.grayBorder ? colors.borderDarker : colors.borderPrimary)};
  margin-bottom: -1px;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: ${props => props.full && 'space-evenly'};
  flex-shrink: 0;
  height: ${dimensions.headerSpacing}px;

  font-size: 0.675rem !important;

`;

const TabCaption = styled.span`
  cursor: pointer;
  display: flex;
  color: ${colors.textSecondary};
  font-weight: ${typography.fontWeightRegular};
  padding: 15px ${dimensions.coreSpacing}px;
  position: relative;
  transition: all ease 0.3s;
  line-height: 18px;
  text-align: center;
  align-items: center;

  &:hover {
    color: ${colors.textPrimary};
  }

  i {
    margin-right: 3px;
  }

  &.active {
    color: ${colors.textPrimary};
    font-weight: 500;

    &:before {
      border-bottom: 3px solid ${colors.colorSecondary};
      content: '';
      width: 100%;
      position: absolute;
      z-index: 1;
      left: 0;
      bottom: -1px;
    }
  }
`;

export {
  NotificationSeeAll,
  NotificationWrapper,
  MarkAllRead,
  CreatedUser,
  AvatarSection,
  TabCaption,
  TabContainer
};
