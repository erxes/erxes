import { colors, dimensions } from 'modules/common/styles';
import { BarItems } from 'modules/layout/styles';
import styled from 'styled-components';

// header
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 20px 6px;
  background: ${colors.colorWhite};
  min-height: 50px;
`;

export const ButtonGroup = styled.div`
  display: inline-block;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.borderPrimary};

  a {
    padding: 7px 20px;
    display: inline-block;
    color: ${colors.colorCoreGray};
    font-weight: 500;
    border-radius: 17px;

    i {
      margin-right: 5px;
    }

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

export const HeaderItems = styled(BarItems)`
  > * + * {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

export const HeaderButton = styled.div`
  padding: 0 12px;
  line-height: 32px;
  height: 34px;
  border-radius: 4px;
  transition: background 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  vertical-align: middle;

  > i {
    font-size: 8px;
    color: ${colors.colorCoreGray};
    margin-left: 8px;
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
  margin-right: -18px;
  font-weight: 500;
  color: ${colors.colorCoreGray};
`;

export const HeaderVisibility = styled(HeaderButton)`
  background: rgba(0, 0, 0, 0.04);
  cursor: pointer;
  border-radius: 5px;

  > i {
    font-size: 13px;
    margin: 0 5px 0 0;
  }
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
    padding: 0 11px;
    display: block;
    line-height: 34px;

    &:hover {
      color: ${colors.colorCoreDarkGray};
    }
  }

  .filter-success {
    padding: 5px 15px;
    background: #3ccc38;
    font-size: 10px;
    text-decoration: underline;
    box-shadow: none;
  }

  .filter-link {
    color: ${colors.colorCoreGray};
    padding: 0 12px;
    display: block;
    line-height: 34px;
    span {
      margin-left: 0;
    }
  }
`;
