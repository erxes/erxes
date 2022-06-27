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

const LabelsTableWrapper = styled.div`
  border: 1px solid ${colors.borderDarker};
  border-radius: 5px;
  padding: 10px 0px !important;
`;

export {
  FilterContainer,
  ColorPickerWrapper,
  ColorPick,
  ColorPicker,
  LabelsTableWrapper
};
