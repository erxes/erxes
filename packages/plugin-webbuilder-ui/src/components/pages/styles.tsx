import { colors, dimensions } from '@erxes/ui/src/styles';

import styled from 'styled-components';

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 12px;
    text-transform: capitalize;
    line-height: 15px;
    transition: all ease 0.3s;

    > i {
      visibility: hidden;
      margin-left: ${dimensions.unitSpacing}px;
    }

    > a {
      display: flex;
      color: inherit;
      cursor: pointer;

      &.active {
        color: ${colors.colorSecondary};
      }

      > i {
        margin-right: 5px;
      }
    }

    .link,
    .link > i:before {
      font-weight: 600;
    }

    &: hover {
      color: ${colors.colorSecondary};

      > i {
        visibility: visible;
        cursor: pointer;
      }
    }
  }
`;

export const PageFormContainer = styled.div`
  background: ${colors.colorWhite};
  border: 1px solid ${colors.borderPrimary};
  height: 100%;
`;

export const PageHeader = styled.div`
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  color: #444;
  align-items: center;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;
