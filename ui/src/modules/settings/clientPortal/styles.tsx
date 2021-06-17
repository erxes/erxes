import colors from 'erxes-ui/lib/styles/colors';
import { dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const StyledUrl = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: normal;
  font-size: 0.8rem;
`;

export const Circle = styledTS<{ active: boolean }>(styled.div)`
  display: inline-box;
  margin-right: 6px;
  background-color: ${props =>
    props.active ? colors.colorSecondary : colors.colorWhite};
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px ${colors.borderPrimary} solid;
`;

export const FlexRow = styled.div`
  flex: 1;
  display: flex;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const SelectsWrap = styled.div`
  > div:first-child {
    padding-bottom: ${dimensions.coreSpacing}px;
  }
`;

export const ButtonWrap = styled.div`
  text-align: right;
`;

export const Title = styled.h2`
  font-size: 16px;
  padding-bottom: ${dimensions.unitSpacing}px;
  border-bottom: 1px dotted ${colors.borderDarker};
`;

export const CheckCircleWrap = styled.div`
  display: flex;

  > div {
    margin-bottom: 0px;

    &:first-child button {
      padding-left: 0px;
    }
  }
`;

export const ColorChooserTile = styled.div`
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  font-size: 12px;
`;

export const TexWrapAdvanced = styled.div`
  text-transform: capitalize;
  color: ${colors.textPrimary} !important;
`;

export const ButtonsWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const LastColorPicker = styled.div`
  padding-right: 0px !important;
`;

export const ColorPickerWrap = styled.div`
  display: flex;
  flex: 1;
  margin-top: ${dimensions.unitSpacing}px;

  > div{
    padding-right: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
    margin-bottom: 0;
`;

export const Wrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  label {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

export const SelectWrap = styled.div`
  flex: 1;

  > div:first-child {
    label {
      font-size: 12px;
      text-transform: capitalize;
      font-weight: unset;
    }
  }
`;

export const IconWrap = styled.div`
  i {
    cursor: pointer;
  }
`;
