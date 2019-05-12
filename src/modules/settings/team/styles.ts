import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const FilterContainer = styled.div`
  position: relative;
  padding: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

const ButtonContainer = styled.div`
  button {
    margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  }
`;

const FlexRow = styled.div`
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

const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;

const AlignedTd = styled.td`
  > * {
    vertical-align: middle;
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const LinkButton = styled.a`
  color: ${colors.colorPrimary};
  cursor: pointer;
  margin-right: ${dimensions.unitSpacing - 5}px;

  &:hover {
    text-decoration: underline;
    color: ${colors.colorPrimary};
  }
`;

export {
  FilterContainer,
  FlexRow,
  ButtonContainer,
  UserAvatar,
  AlignedTd,
  LinkButton
};
