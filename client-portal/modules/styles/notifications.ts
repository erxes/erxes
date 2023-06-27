import { colors, dimensions, typography } from '.';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const NotificationWrapper = styled.div`
  position: relative;
  border-top: 1px solid ${colors.borderPrimary};
`;

const NotificationFooter = styled.div`
  height: 30px;
  padding: 0 ${dimensions.coreSpacing}px;
  font-size: 13px !important;
  color: rgb(23, 133, 252) !important;
  border-top: 1px solid ${colors.borderPrimary};

  > span {
    cursor: pointer;
  }
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
  font-size: 13px !important;
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

const NotificationSettingsRow = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: ${dimensions.coreSpacing}px;

  p {
    margin-bottom: ${dimensions.unitSpacing - 2}px;
  }

  .react-toggle {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;


export {
  NotificationWrapper,
  NotificationFooter,
  NotificationSettingsRow,
  CreatedUser,
  AvatarSection,
  TabCaption,
  TabContainer
};
