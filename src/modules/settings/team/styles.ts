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

  i {
    cursor: help;
    margin: -${dimensions.unitSpacing - 7}px 0 0 5px;
    color: ${colors.colorCoreRed};
  }
`;

export const Emails = styled.div`
  span:last-child {
      margin-bottom: ${dimensions.coreSpacing}px;
    }
  }
`;

export const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;
