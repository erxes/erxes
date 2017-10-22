import styled from 'styled-components';
import { colors } from '../common/styles';

const SidebarList = styled.main`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    border-bottom: 1px solid ${colors.borderPrimary};

    &:last-child {
      border: none;
    }
  }

  a {
    display: block;
    padding: 5px 20px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 30px;
    cursor: pointer;
    text-decoration: none;
    outline: 0;

    &:hover {
      background: ${colors.borderPrimary};
    }
  }
`;

export { SidebarList };
