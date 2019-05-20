import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  EmailContent,
  Timeline
} from 'modules/activityLogs/styles';
import { colors, dimensions, typography } from 'modules/common/styles';
import { ActivityContent } from 'modules/common/styles/main';
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
    padding: 5px 0;
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

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;

  > a,
  button {
    flex: 1;
  }

  > div {
    margin-left: 10px;
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

const NoteFormContainer = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};

  > span {
    padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
      ${dimensions.unitSpacing}px;
    display: block;
  }

  .draftJsToolbar__toolbar__dNtBH button {
    width: 25px;
  }
`;

const ActivityLogContent = styled(ActivityContent)`
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

  ${ActivityRow} {
    padding: ${dimensions.unitSpacing * 1.5}px 0;
    box-shadow: none;
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
  margin-top: 10px;

  .icon-edit {
    display: none;
  }
`;

const TabContent = styled.div`
  ul {
    padding: ${dimensions.unitSpacing}px 0;
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
  SectionContainer,
  Actions,
  NoteFormContainer,
  ActivityLogContent,
  BasicInfo,
  SidebarCollapse,
  TabContent
};
