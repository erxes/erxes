import { colors, dimensions, typography } from 'modules/common/styles';
import { BarItems as BarItemsCommon } from 'modules/layout/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

// header
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px ${dimensions.coreSpacing}px 2px;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  z-index: 2;
  @media (max-width: 768px) {
    min-height: auto;
    flex-direction: column;
  }
`;

export const ButtonGroup = styled.div`
  display: inline-block;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid ${colors.bgActive};
  > a {
    padding: 7px ${dimensions.coreSpacing}px;
    display: inline-block;
    color: ${colors.colorCoreGray};
    font-weight: 500;
    border-radius: 17px;
    &.active {
      color: ${colors.colorCoreDarkGray};
      background: ${colors.colorWhite};
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
      i {
        color: ${colors.colorSecondary};
      }
    }
    &:last-of-type {
      border: none;
    }
    &:hover {
      color: ${colors.colorCoreDarkGray};
    }
  }
`;

export const HeaderButton = styledTS<{
  hasBackground?: boolean;
  rightIconed?: boolean;
  isActive?: boolean;
}>(styled.div)`
  padding: 0 ${dimensions.unitSpacing}px;
  line-height: ${dimensions.coreSpacing + 10}px;
  height: ${dimensions.coreSpacing + 12}px; 
  border-radius: ${dimensions.unitSpacing - 6}px;
  transition: background 0.3s ease;
  background: ${props => props.hasBackground && 'rgba(0, 0, 0, 0.04)'};
  font-weight: ${typography.fontWeightMedium};
  display: inline-block;
  vertical-align: middle;
  font-size: ${typography.fontSizeHeading8}px;
  > i {
    color: ${props =>
      props.isActive ? colors.colorCoreLightGray : colors.colorCoreGray};
    margin-right: ${dimensions.unitSpacing - 5}px;
    ${props =>
      props.rightIconed &&
      css`
        margin-right: -3px;
        margin-left: ${dimensions.unitSpacing - 5}px;
      `};
  }
  &:hover {
    background: rgba(0, 0, 0, 0.06);
    cursor: pointer;
  }
  a span {
    margin: 0;
  }
`;

export const HeaderLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  margin-right: -5px;
  font-weight: 500;
  color: ${colors.colorCoreGray};
`;

export const HeaderLink = styled(HeaderButton)`
  padding: 0;
  margin-left: 10px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 17px;
  line-height: 21px;
  a {
    color: ${colors.colorCoreGray};
    padding: 0 10px;
    display: block;
    line-height: 32px;
    &:hover {
      color: ${colors.colorCoreDarkGray};
    }
  }
`;

export const BarItems = styled(BarItemsCommon)`
  .dropdown-menu {
    max-height: 360px;
    max-height: calc(100vh - 120px);
    overflow: auto;
    background: ${colors.colorWhite};
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all ease 0.3s;
      > i {
        padding: 0 ${dimensions.unitSpacing + 5}px;
      }
      > a {
        flex: 1;
        &:hover,
        &:focus {
          background: transparent;
        }
      }
      &:hover {
        background: ${colors.bgActive};
      }
    }
  }
`;
