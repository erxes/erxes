import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { RowTitle } from '../main/styles';

export const StyledUrl = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: normal;
  font-size: 0.8rem;
`;

export const Circle = styledTS<{ active: boolean }>(styled.div)`
  display: inline-box;
  margin-right: ${dimensions.unitSpacing - 4}px;
  background-color: ${props =>
    props.active ? colors.colorSecondary : colors.colorWhite};
  width: 14px;
  height: 14px;
  border-radius: ${dimensions.unitSpacing - 3}px;
  border: 2px ${colors.borderPrimary} solid;
`;

export const FlexRow = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const ChooserWrap = styled.div`
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

export const RadioButtonWrap = styled.div`
  display: flex;
  align-items: center;
  text-transform: capitalize;
  color: ${colors.textPrimary} !important;
`;

export const ColorPickerWrap = styled.div`
  display: flex;
  flex: 1;
  margin-top: ${dimensions.unitSpacing}px;

  > div {
    padding-right: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
    margin-bottom: 0;
  }
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
    margin-bottom: 0;

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

export const Content = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const BlockRow = styled(FlexRow)`
  align-items: center;

  > div {
    padding-right: ${dimensions.coreSpacing}px;
    width: 25%;

    &.description {
      width: 50%;
    }

    @media (max-width: 1250px) {
      flex: 1;
    }
  }
`;

export const BlockRowTitle = styled(RowTitle)`
  width: 150px;
  margin: 0;
`;

export const ToggleWrap = styled.div`
  width: 180px !important;

  > div > div {
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

export const LogoWrapper = styled.div`
  > div > div {
    width: ${dimensions.coreSpacing}%;
  }
`;
