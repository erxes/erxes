import { colors, dimensions } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

// header
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px ${dimensions.coreSpacing}px 6px;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  min-height: 50px;

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

  a {
    padding: 7px ${dimensions.coreSpacing}px;
    padding: 6px 20px;
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
  padding: 0 10px;
  line-height: 30px;
  height: 32px;
  border-radius: 4px;
  transition: background 0.3s ease;
  background: ${props => props.hasBackground && 'rgba(0, 0, 0, 0.04)'};
  font-weight: 500;
  display: inline-block;
  vertical-align: middle;

  > i {
    color: ${props =>
      props.isActive ? colors.colorSecondary : colors.colorCoreGray};
    margin-right: 5px;

    ${props =>
      props.rightIconed &&
      css`
        margin-right: -3px;
        margin-left: 5px;
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
