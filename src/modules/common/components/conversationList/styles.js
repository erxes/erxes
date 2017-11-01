import styled from 'styled-components';
import { colors, dimensions } from '../../styles';

const ConversationItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RowItem = styled.div`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  background: ${props => props.isRead && colors.bgLight};
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const RowContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
`;

const FlexContent = styled.div`
  flex: 1;
`;

const CheckBox = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
`;

const MainInfo = styled.div`
  overflow: hidden;

  a {
    float: left;
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const CustomerName = styled.div`
  font-weight: 500;
`;

const SmallText = styled.div`
  color: ${colors.colorCoreLightGray};
  font-size: 12px;
`;

const MessageContent = styled.div`
  color: ${colors.colorCoreLightGray};
  margin: ${dimensions.unitSpacing}px 0;
  word-break: break-word;
  overflow: hidden;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
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
  MessageContent
};
