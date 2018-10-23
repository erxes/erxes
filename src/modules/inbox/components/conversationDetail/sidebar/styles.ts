import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  EmailContent,
  FlexContent,
  Timeline
} from 'modules/activityLogs/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { ActivityContent } from 'modules/common/styles/main';
import { EditorActions } from 'modules/internalNotes/components/Form';
import { SidebarBox, SidebarTitle } from 'modules/layout/styles';
import styled from 'styled-components';

const iconWrapperWidth = '60px';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px ${dimensions.unitSpacing}px;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const FlexItem = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const DateFilters = styled.div`
  width: 305px;

  button {
    padding: 5px 20px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;

  button {
    min-width: 80px;
  }
`;

const SectionContainer = styled.div`
  position: relative;
  border-top: 1px solid ${colors.borderPrimary};

  > div {
    margin-bottom: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  ${SidebarBox} {
    box-shadow: none;
  }

  ${SidebarTitle} {
    height: 40px;
  }
`;

const ActivityNote = styled.div`
  border-bottom: 2px solid ${colors.borderPrimary};
  padding-bottom: ${dimensions.coreSpacing}px;

  > span {
    padding: 0 ${dimensions.coreSpacing}px;
  }

  textarea {
    color: ${colors.colorCoreGray};
  }

  ${EditorActions} {
    bottom: -15px;
  }
`;

const ActivityLogContent = ActivityContent.extend`
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: 30px;

  ${Timeline} {
    padding-left: 30px;

    &:before {
      left: 5px;
    }
  }

  ${AvatarWrapper} {
    display: none;
  }

  ${ActivityIcon} {
    left: calc(-${iconWrapperWidth} + ${iconWrapperWidth} * 0.3);
  }

  ${FlexContent} {
    display: block;
  }

  ${ActivityRow} {
    background: ${colors.bgLight};
  }

  ${ActivityDate} {
    margin: 0;
    font-style: italic;
    font-size: ${typography.fontSizeUppercase}px;
  }

  ${EmailContent} {
    padding: 0;
  }
`;

const BasicInfo = styled.div`
  .icon-edit {
    display: none;
  }
`;

const SidebarCollapse = styled.a`
  color: ${colors.colorCoreGray};
  position: absolute;
  top: ${dimensions.unitSpacing}px;
  right: ${dimensions.coreSpacing}px;
  font-size: 15px;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: 0;
  }
`;

export {
  FlexRow,
  FlexItem,
  DateFilters,
  SectionContainer,
  Actions,
  ActivityNote,
  ActivityLogContent,
  BasicInfo,
  SidebarCollapse
};
