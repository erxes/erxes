import colors from 'modules/common/styles/colors';
import styled from 'styled-components';

const QuickReplies = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -4px;
`;

const ReplyButton = styled.div`
  padding: 5px 15px;
  border: 1px solid ${colors.colorPrimary};
  margin: 8px 4px;
  border-radius: 20px;
  font-weight: 500;
  color: ${colors.colorCoreBlack};

  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;

const CardsWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  transition: transform 0.3s;
  flex-wrap: wrap;
`;

const CardItem = styled.div`
  flex-shrink: 0;
  margin: 10px 15px 0 0;
  width: 240px;
  background: ${colors.colorWhite};
  border-radius: 8px;
  border: 1px solid rgb(219, 225, 232);
  overflow: hidden;
  transition: opacity 0.3s;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  user-select: none;

  h4 {
    font-size: 15px;
  }

  h4,
  p {
    margin-top: 8px;
    margin-bottom: 0;
  }

  img {
    max-width: 100%;
  }
`;

const CardContent = styled.div`
  padding: 8px 16px 16px 16px;

  p {
    color: $text-color;
  }
`;

const CardAction = styled.div`
  padding: 8px 16px;
  border-top: 1px solid rgb(219, 225, 232);
  display: block;
  text-align: center;
  font-weight: 500;

  &:hover {
    background: ${colors.bgLight};
  }
`;

const CardUrl = styled(CardAction.withComponent('a'))`
  text-decoration: none;
`;

export {
  QuickReplies,
  ReplyButton,
  CardsWrapper,
  CardItem,
  CardContent,
  CardAction,
  CardUrl
};
