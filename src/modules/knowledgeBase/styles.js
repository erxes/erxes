import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const KnowledgeBaseRow = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const RowRightSide = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  padding-right: ${dimensions.coreSpacing}px;

  i {
    padding: ${dimensions.unitSpacing}px 0;
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
    content: '\\e827';
    font-family: 'erxes';
    float: right;
    transition: all ease 0.3s;
    margin-left: ${dimensions.unitSpacing}px;
    transform: ${props => props.isOpen && `rotate(180deg)`};
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 10px 20px;

  span {
    display: block;
    font-size: 12px;
    color: ${colors.colorCoreGray};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: transform 0.3s ease;
  transform: translate(80px);

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const Categories = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid ${colors.borderPrimary};
`;

const CategoryItem = styled.li`
  position: relative;
  background: ${props => (props.isActive ? colors.bgActive : colors.bgLight)};
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  padding-right: 20px;
  overflow: hidden;

  a {
    padding: 10px 0 10px 40px;
    white-space: normal;
    display: block;
    color: ${colors.textPrimary};
    position: relative;
    flex: 1;
    max-width: 100%;
    overflow: hidden;

    span {
      color: ${colors.colorCoreGray};
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    background: ${colors.colorWhite};

    ${ActionButtons} {
      transform: translate(0px);
    }
  }
`;

const Row = styled.div`
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
      transform: translate(0px);
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

const ArticleColumn = styled.div`
  flex: 1;
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
  margin: 0 20px 0 5px;
`;

export {
  KnowledgeBaseRow,
  RowRightSide,
  CategoryItem,
  ActionButtons,
  SectionHead,
  SectionTitle,
  Categories,
  ArticleTitle,
  ArticleColumn,
  ArticleMeta,
  AuthorName,
  DropIcon,
  RightButton,
  Row
};
