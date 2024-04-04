import { colors, dimensions } from '@erxes/ui/src/styles';

import { FlexItem } from '@erxes/ui/src/components/step/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const List = styledTS<{ showDarkMode: boolean }>(styled.ul)`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    text-transform: capitalize;
    line-height: 15px;
    transition: all ease 0.3s;
    cursor: pointer;
    border-bottom: 1px solid ${props =>
      props.showDarkMode ? '#666' : colors.borderPrimary};

    > i {
      visibility: hidden;
      margin-left: ${dimensions.unitSpacing}px;
    }

    > a {
      display: flex;
      color: inherit;
      padding: 8px 0;
      flex: 1;

      > div {
        flex: 1;
      }

      &.active {
        color: ${colors.colorSecondary};
      }

      > i {
        margin-right: 5px;
      }
    }

    &.link,
    &.link > i:before {
      font-weight: 600;
      cursor: pointer;
      padding: 8px 0;
    }

    &:last-child {
      border: 0;
    }

    &: hover {
      color: ${colors.textPrimary};
      background: ${colors.bgActive};

      &.link {
        background: none;
        color: ${props => props.showDarkMode && colors.colorShadowGray};
      }

      > i {
        visibility: visible;
        cursor: pointer;
      }
    }
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

export const PageFormContainer = styled.div`
  width: 500px;
  height: 100%;
  position: relative;
`;
