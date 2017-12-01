import styled, { css } from 'styled-components';
import { colors, dimensions } from '../../styles';

const ConversationItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RowContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;

  > div {
    margin: 0;
    align-self: center;

    &:first-of-type {
      display: none;
    }
  }
`;

const FlexContent = styled.div`
  flex: 1;
  transition: all ease 0.3s;

  .tags {
    margin-top: 10px;
  }
`;

const CheckBox = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
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
  font-weight: 400;
  word-break: break-all;
`;

const SmallText = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  padding: 2px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  word-break: break-word;
  overflow: hidden;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const RowItem = styled.li`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${colors.borderPrimary};
  transition: all ease 0.3s;

  background: ${props => props.isActive && colors.bgActive};

  ${props =>
    !props.isRead &&
    css`
      background: ${colors.bgUnread};

      ${MessageContent} {
        font-weight: 500;
      }
    `};
  &:hover {
    background: ${props =>
      !props.isRead || props.isActive ? '' : colors.bgLight};
    cursor: pointer;
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

export {
  ConversationItems,
  RowItem,
  RowContent,
  FlexContent,
  CheckBox,
  MainInfo,
  CustomerName,
  SmallText,
  MessageContent,
  AssigneeImg,
  AssigneeWrapper
};
