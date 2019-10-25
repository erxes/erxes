import styled from 'styled-components';
import { colors, dimensions } from '../../styles';

const buttonSize = 28;

const PaginationWrapper = styled.div`
  background: ${colors.bgLight};
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid ${colors.borderPrimary};
  margin-top: -1px;
  position: relative;
`;

const PaginationList = styled.ul`
  display: inline-block;
  padding-left: 0;
  margin: 0;
  list-style: none;
  padding: 11px ${dimensions.coreSpacing}px;

  > li {
    display: inline;
    display: inline-flex;
    margin-right: 3px;

    > a,
    > span {
      position: relative;
      float: left;
      min-width: ${buttonSize}px;
      height: ${buttonSize}px;
      padding: 0 ${dimensions.unitSpacing / 2}px;
      border-radius: ${buttonSize / 2}px;
      line-height: ${buttonSize}px;
      color: ${colors.colorCoreGray};
      text-align: center;
      text-decoration: none;
      outline: 0;
      transition: all ease 0.3s;

      i {
        margin: 0;
        font-size: 16px;
      }

      &:hover {
        background: ${colors.borderPrimary};
      }
    }

    &.disabled > a,
    &.disabled > span {
      color: ${colors.colorLightGray};
      cursor: not-allowed;
    }

    &.active > a {
      z-index: 3;
      color: ${colors.colorWhite};
      background-color: ${colors.colorSecondary};
    }
  }
`;

const PerPageButton = styled.a`
  font-weight: normal;
  color: ${colors.colorCoreGray};
  cursor: pointer;
  margin-left: 15px;
  position: relative;
  top: -2px;

  i {
    margin-left: 3px;
  }
`;

const Option = styled.li`
  a {
    cursor: pointer;
  }
`;

export { PaginationWrapper, PaginationList, PerPageButton, Option };
