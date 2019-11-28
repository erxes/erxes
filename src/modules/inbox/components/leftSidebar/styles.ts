import { colors, dimensions } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const RightItems = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-right: 10px;
  }
`;

const ConversationItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const CheckBox = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
`;

const RowContent = styledTS<{ isChecked?: boolean }>(styled.div)`
  flex: 1;
  display: flex;
  flex-direction: row;
  transition: all ease 0.3s;

  &:hover {
    ${CheckBox} {
      width: 30px;
    }
  }

  ${CheckBox} {
    width: ${props => (props.isChecked ? '30px' : '0')};

    overflow: hidden;
    transition: all ease 0.3s;

    > label {
      margin-top: 10px;
    }
  }

  > div {
    margin: 0;
  }
`;

const FlexContent = styled.div`
  flex: 1;
  transition: all ease 0.3s;

  .tags {
    margin-top: ${dimensions.unitSpacing - 3}px;
  }
`;

const MainInfo = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;

  > span {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const CustomerName = styled.div`
  word-break: break-all;
  overflow: hidden;
  height: ${dimensions.coreSpacing}px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const SmallText = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  margin: 2px 0;
  min-height: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
`;

const SmallTextOneLine = styled(SmallText)`
  max-height: ${dimensions.coreSpacing}px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const MessageContent = styled.div`
  margin-top: ${dimensions.unitSpacing - 3}px;
  word-break: break-word;
  overflow: hidden;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  max-height: 18px;
`;

const RowItem = styledTS<{
  isActive?: boolean;
  isRead?: boolean;
  isIdle?: boolean;
}>(styled.li)`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  position: relative;
  flex-direction: row;
  border-bottom: 1px solid ${colors.borderPrimary};
  transition: all ease 0.3s;
  background: ${props => (props.isActive ? colors.bgActive : null)};

  ${props =>
    !props.isRead &&
    css`
      background: ${colors.bgUnread};

      ${MessageContent} {
        font-weight: bold;
      }
    `};
  &:hover {
    background: ${props =>
      !props.isRead || props.isActive ? '' : colors.bgLight};
    cursor: pointer;
  }

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    border: 5px solid transparent;
    ${props =>
      props.isIdle &&
      css`
        border-right-color: ${colors.colorCoreRed};
        border-bottom-color: ${colors.colorCoreRed};
      `};
  }
`;

const AssigneeImg = styled.img`
  height: ${dimensions.coreSpacing}px;
  line-height: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.coreSpacing / 2}px;
`;

const AssigneeWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SidebarActions = styled.div`
  #date-popover {
    max-width: 470px;
    width: 500px;
  }

  .rdtPicker {
    width: 100%;
  }
`;

const LeftContent = styledTS<{ isOpen?: boolean }>(styled.div)`
  display: flex;
  position: relative;
  flex-direction: row;
  padding-left: ${props => props.isOpen && '200px'};
  transition: padding 0.3s ease;
  margin: 10px 10px 10px 0;
  box-shadow: 0 0 5px 0 rgba(0,0,0,.08);

  > section {
    margin: 0;
    box-shadow: none;
  }
`;

const shadowColor = 'rgba(0,0,0,0.15)';

const AdditionalSidebar = styled.div`
  width: 200px;
  background: ${colors.bgLight};
  flex-shrink: 0;
  padding: 10px 0;
  box-shadow: inset -40px 0px 40px -40px ${shadowColor};
  overflow: auto;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;

  ul > li > a {
    padding: 5px 22px;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;

  > div {
    padding-left: 20px;
  }
`;

const GroupTitle = styledTS<{ isOpen?: boolean }>(styled.div)`
  font-weight: bold;
  line-height: 32px;
  padding: 0 20px;
  color: ${props => props.isOpen && colors.colorSecondary};
  user-select: none;
  transition: color ease 0.3s;

  i {
    margin-left: 5px;
    margin-right: 0;
    display: inline-block;
    transition: all ease 0.3s;
    transform: ${props => props.isOpen && 'rotate(180deg)'};
  }

  &:hover {
    cursor: pointer;
  }
`;

export {
  ConversationItems,
  RightItems,
  RowItem,
  RowContent,
  FlexContent,
  CheckBox,
  MainInfo,
  CustomerName,
  SmallText,
  SmallTextOneLine,
  MessageContent,
  AssigneeImg,
  AssigneeWrapper,
  SidebarActions,
  AdditionalSidebar,
  GroupTitle,
  LeftContent,
  DropdownWrapper
};
