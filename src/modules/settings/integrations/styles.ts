import { colors, dimensions } from 'modules/common/styles';
import { darken, lighten } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .flex-item {
    flex: 1;
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin: 0;
    }

    input[type='checkbox'] {
      display: inline-block;
      height: auto;
      width: auto;
      margin-right: 5px;
    }
  }

  span {
    margin: 0 5px;

    .Select-value-label {
      color: ${colors.colorLightGray} !important;
    }
  }

  button {
    margin-left: ${dimensions.coreSpacing / 2}px;
  }

  & + div {
    margin-top: ${dimensions.coreSpacing / 2}px;
  }
`;

const Row = styled.div`
  display: flex;
  height: 100%;
`;

const MessengerPreview = styled.div`
  width: 40%;
`;

const IntegrationName = styled.span`
  margin-right: ${dimensions.unitSpacing}px;
`;

const BrandName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

const LinkedAccount = styledTS<{ isRemove?: boolean }>(styled.button)`
  width: 150px;
  background: ${colors.bgLight};
  margin-left: ${dimensions.unitSpacing}px;
  color: ${props =>
    props.isRemove ? colors.colorCoreRed : colors.colorCoreGreen};
  border: 1px solid ${props =>
    props.isRemove ? colors.colorCoreRed : colors.colorCoreGreen};
  border-radius: 5px;
  padding: ${dimensions.unitSpacing - 2}px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  transition: all ease 0.3s;

  &:hover {
    box-shadow: 0 2px 16px 0 ${props =>
      props.isRemove
        ? lighten(colors.colorCoreRed, 45)
        : lighten(colors.colorCoreGreen, 45)};
  }

  &:focus {
    outline: 0;
  }
`;

export {
  FlexRow,
  Row,
  MessengerPreview,
  IntegrationName,
  BrandName,
  LinkedAccount
};
