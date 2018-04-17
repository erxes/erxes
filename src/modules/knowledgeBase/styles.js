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
    transform: ${props => props.isOpen && `rotate(180deg)`};
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
  transition: width 0.3s ease;
  background: transparent;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const CategoryItem = styled.li`
  position: relative;
  background: ${props => (props.isActive ? colors.bgActive : colors.bgLight)};

  a {
    padding: 10px 40px;
    white-space: normal;
    display: block;
    color: ${colors.textPrimary};
    position: relative;

    &:focus {
      color: inherit;
      text-decoration: none;
    }
  }

  &:hover {
    cursor: pointer;
    background: ${colors.colorWhite};

    ${ActionButtons} {
      width: 50px;
      padding-right: ${dimensions.coreSpacing}px;
      background: ${colors.colorWhite};
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
      width: ${dimensions.coreSpacing * 2}px;
      right: ${dimensions.coreSpacing}px;
    }
  }
`;

const ArticleTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
  margin-right: ${dimensions.unitSpacing}px;
`;

const ArticleColumn = styled.div`
  position: relative;
  padding-right: ${dimensions.coreSpacing * 2}px;
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
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  line-height: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.coreSpacing / 2}px;
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
  CategoryItem,
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
