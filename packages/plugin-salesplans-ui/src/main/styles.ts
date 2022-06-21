import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const FilterContainer = styled.div`
  position: relative;
  padding-bottom: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

const ColorPickerWrapper = styled.div`
  > div > div {
    width: 50px;
    height: 30px;
  }
`;

const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 3px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 80px;
  height: 27px;
  border-radius: 2px;,
`;

const Capitalize = styled.span`
  text-transform: capitalize;
  font-weight: 500;
`;

const RowTitle = styled.div`
  > a {
    color: ${colors.textPrimary};
  }

  &:hover {
    text-decoration: underline;
    color: ${colors.colorBlack};
    cursor: pointer;
  }
`;

const SalesPlansWrapper = styled.div`
  padding: ${dimensions.unitSpacing}px;
`;

export {
  FilterContainer,
  ColorPickerWrapper,
  ColorPick,
  ColorPicker,
  Capitalize,
  RowTitle,
  SalesPlansWrapper
};
