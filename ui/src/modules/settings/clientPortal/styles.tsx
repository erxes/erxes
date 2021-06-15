import colors from 'erxes-ui/lib/styles/colors';
import { dimensions } from 'modules/common/styles';
import { FlexContent } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Domain = styled(FlexContent)`
  align-items: flex-end;

  span {
    font-size: 14px;
    font-weight: 500;
    flex: initial;
  }
`;

export const StyledUrl = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: normal;
  font-size: 0.8rem;
`;

export const Circle = styledTS<{ active: boolean }>(styled.div)`
  display: inline-box;
  margin-right: 6px;
  background-color: ${props =>
    props.active ? colors.colorPrimaryDark : 'white'};
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 2px lightGray solid;
`;

export const Full = styled.div`
  width: 100%;
  display: flex;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const Half = styled.div`
  width: 50%;
`;

export const SelectsWrap = styled.div`
  > div:first-child {
    padding-bottom: 20px;
  }
`;

export const ButtonWrap = styled.div`
  text-align: right;
`;

export const TitleWrap = styled.div`
  h2 {
    font-size: 11px;
    text-transform: uppercase;
  }

  label {
    text-transform: capitalize;
    font-size: 12px;
    color: ${colors.colorCoreGray};
  }
`;

export const CheckCircleWrap = styled.div`
  display: flex;

  div {
    margin-bottom: 0px;
  }
`;

export const TextWrapColor = styled.div`
  text-transform: capitalize;
  color: ${colors.textPrimary} !important;
  width: 100px;
`;

export const TexWrapAdvanced = styled.div`
  text-transform: capitalize;
  color: ${colors.textPrimary} !important;
`;
export const ButtonsWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const FirstCheckCircle = styled.div`
  div {
    button {
      padding-left: 0px;
    }
  }
`;

export const LastColorPicker = styled.div`
  padding-right: 0px !important;
`;

export const ColorPickerWrap = styled.div`
  display: flex;
  margin-top: 20px;

  div{
    margin-bottom: 0px;
  }

  >div{
    padding-right: ${dimensions.coreSpacing}px;
`;

export const Wrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  label {
    margin-right: 10px;
  }
`;

export const SelectWrap = styled.div`
  margin-top: 20px;
`;
