import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 12px;
    text-transform: capitalize;
    cursor: pointer;
    line-height: 15px;
    transition: all ease 0.3s;

    > i {
      visibility: hidden;
    }

    > div {
      &.link {
        color: ${colors.colorWhite};
      }

      > i {
        margin-right: 5px;
      }
    }

    &: hover {
      color: ${colors.colorSecondary};

      > i {
        visibility: visible;
      }
    }
  }
`;
