import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const FilterContainer = styled.div`
  position: relative;
  padding-bottom: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

const ButtonContainer = styled.div`
  button {
    margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: 5px 30px 5px 0;
  position: relative;
  align-items: center;

  > label {
    margin: 0;
    font-weight: 500;
    color: ${colors.colorCoreBlack};
  }

  > *:first-child,
  input {
    margin-right: ${dimensions.unitSpacing}px;
    flex: 3;
  }

  > *:nth-child(2),
  > div {
    flex: 2;
  }
`;

const RemoveRow = styled.a`
  top: ${dimensions.unitSpacing + 2}px;
  margin-left: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing / 2}px;
  color: ${colors.colorCoreDarkGray};

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreRed};
  }
`;

const InviteOption = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export {
  FilterContainer,
  FlexRow,
  ButtonContainer,
  LinkButton,
  RemoveRow,
  InviteOption
};
