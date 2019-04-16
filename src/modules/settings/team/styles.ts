import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

export const FilterContainer = styled.div`
  position: relative;
  padding: ${dimensions.coreSpacing}px;
  z-index: ${dimensions.unitSpacing};
`;

export const ButtonContainer = styled.div`
  button {
    margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  }
`;

export const FlexRow = styled.div`
  display: flex;
  align-items: center;

  input {
    margin-bottom: ${dimensions.coreSpacing}px;
  }

  i {
    cursor: pointer;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

export const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;

export const LinkButton = styled.a`
  color: ${colors.colorPrimary};
  cursor: pointer;
  margin-right: ${dimensions.unitSpacing - 5}px;

  &:hover {
    text-decoration: underline;
    color: ${colors.colorPrimary};
  }
`;
