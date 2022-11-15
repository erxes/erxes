import { colors, dimensions } from '@erxes/ui/src/styles';

import { ActionButtons } from '@erxes/ui-settings/src/styles';
import styled from 'styled-components';

const RowArticle = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: 20px 20px 20px 30px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  i {
    color: ${colors.colorCoreGray};
  }

  &:hover {
    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const ArticleTitle = styled.h5`
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 ${dimensions.unitSpacing}px;

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const ArticleMeta = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  display: flex;
  align-items: center;

  img {
    width: ${dimensions.coreSpacing}px;
    height: ${dimensions.coreSpacing}px;
    line-height: ${dimensions.coreSpacing}px;
    border-radius: ${dimensions.coreSpacing / 2}px;
  }

  i,
  img {
    margin-right: ${dimensions.unitSpacing / 2}px;
  }
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: ${colors.colorCoreDarkGray};
  margin: 0 ${dimensions.coreSpacing}px 0 5px;
`;

const ReactionCounts = styled.div`
  margin: 0 ${dimensions.coreSpacing}px;
  display: flex;

  > span {
    margin-right: ${dimensions.unitSpacing}px;
    font-weight: 500;
  }
`;

const ReactionCount = styled.span`
  display: flex;
  align-items: center;

  img {
    width: 16px;
    margin-right: ${dimensions.unitSpacing / 2}px;
    box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.1);
    height: 16px;
    padding: 1px;
  }
`;

const ReactionItem = styled(ReactionCount)`
  margin-left: -8px;

  img {
    marign-right: ${dimensions.unitSpacing}px;
    box-shadow: none;
    padding: 0;
  }
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

const Forms = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
`;

const FlexRow = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  > div {
    margin: 0 20px 10px 0;
    flex: 1;
  }
`;

export {
  RowArticle,
  ArticleTitle,
  ArticleMeta,
  AuthorName,
  ReactionCounts,
  ReactionCount,
  ReactionItem,
  FillContent,
  FlexRow,
  Forms
};
