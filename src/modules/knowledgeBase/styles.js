import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const SidebarContent = styled.div`
  flex: 1;
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  background: ${colors.colorWhite};
  box-shadow: 0 0 4px ${colors.shadowPrimary};

  &:last-child {
    margin-bottom: ${dimensions.headerSpacing}px;
  }
`;

const RowRightSide = styled.span`
  display: flex;
  font-size: 12px;
  color: ${colors.colorCoreGray};
  right: ${dimensions.coreSpacing}px;
  position: absolute;

  i {
    padding: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const RightButton = styled.div`
  width: ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: flex-end;

  &:hover {
    cursor: pointer;
  }
`;

const DropIcon = styled.span`
  &:after {
    content: '\f123';
    font-family: 'Ionicons';
    float: right;
    transition: all ease 0.3s;
  }

  &.true:after {
    transform: rotate(180deg);
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
`;

const SectionTitle = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 10px 50px 10px 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const CountArticle = styled.span`
  color: ${colors.colorCoreGray};
  display: flex;
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  top: 0;
  align-items: center;
  bottom: 0;
`;

const Categories = styled.ul`
  overflow: hidden;
  margin: 0;
  padding: 0;
  list-style: none;
  transition: all ease 0.3s;
`;

const ActionButtons = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const ArticleWrap = styled.li`
  position: relative;
  background: ${props => (props.isActive ? colors.bgActive : colors.bgLight)};

  a {
    padding: 10px 40px;
    white-space: normal;

    &:focus {
      color: inherit;
      text-decoration: none;
    }
  }

  &:hover {
    cursor: pointer;
    background: ${colors.bgActive};

    ${ActionButtons} {
      width: ${dimensions.headerSpacing - 5}px;
      background: ${colors.bgActive};
    }
  }
`;

const Articles = styled.div`
  flex: 1;
`;

const Row = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
  border-radius: 2px;
  padding: 20px;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.12);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  i {
    color: ${colors.colorCoreGray};
  }

  &:hover {
    ${ActionButtons} {
      width: ${dimensions.headerSpacing - 5}px;
    }
  }
`;

const ArticleTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const ArticleColumn = styled.div`
  position: relative;
  padding-right: 20px;
  flex: 1;
`;

const ArticleAuthor = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  display: flex;
  align-items: center;
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: ${colors.colorCoreDarkGray};
  padding: 0 20px 0 5px;
`;

const AuthorImg = styled.img`
  width: 20px;
  border-radius: 10px;
  display: inline-block;
  border: 1px solid ${colors.borderPrimary};
  margin-right: 5px;
`;

const ArticleSummary = styled.p`
  flex: 1;
  margin-top: 10px;
`;

export {
  SidebarContent,
  RowRightSide,
  ArticleWrap,
  ActionButtons,
  CountArticle,
  SectionHead,
  SectionTitle,
  Categories,
  Articles,
  ArticleTitle,
  ArticleColumn,
  ArticleAuthor,
  AuthorName,
  ArticleSummary,
  AuthorImg,
  DropIcon,
  RightButton,
  Row
};
