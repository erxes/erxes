import { colors } from 'modules/common/styles';
import styled from 'styled-components';

export const FilterContainer = styled.div`
  position: relative;
  padding: 20px;
  z-index: 10;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.borderPrimary};
`;

export const ButtonContainer = styled.div`
  button {
    margin: 20px 0 0 20px;
  }
`;

export const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;
