import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

export const FilterContainer = styled.div`
  position: relative;
  padding: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

export const ButtonContainer = styled.div`
  button {
    margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  }
`;

export const FlexRow = styled.div`
  display: flex;

  input {
    margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  }

  i {
    cursor: pointer;
    padding-left: ${dimensions.coreSpacing}px;
  }

  label:last-child {
      margin-left: ${dimensions.coreSpacing + 13}%;
    }
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
