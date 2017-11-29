import styled from 'styled-components';
import { colors, dimensions } from '../../styles';

const buttonSize = 28;

const PaginationWrapper = styled.div`
  background: ${colors.bgLight};
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
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
      padding: 0 ${dimensions.unitSpacing}px;
      border-radius: ${buttonSize / 2}px;
      line-height: ${buttonSize}px;
      color: ${colors.colorCoreGray};
      text-align: center;
      font-weight: 400;
      text-decoration: none;
      outline: 0;
      transition: all ease 0.3s;

      i {
        margin: 0;
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
      background-color: ${colors.colorPrimary};
    }
  }
`;

export { PaginationWrapper, PaginationList };
