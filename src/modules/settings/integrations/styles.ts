import { colors, dimensions } from 'modules/common/styles';
import { darken, lighten } from 'modules/common/styles/color';
import styled from 'styled-components';

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

const LinkedAccountButton = styled.button`
  width: 35px;
  margin-left: ${dimensions.unitSpacing}px;
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 2px 16px 0 ${lighten(colors.colorPrimary, 45)};
  transition: all ease 0.3s;

  &:hover {
    box-shadow: 0 2px 22px 0 ${lighten(colors.colorPrimary, 25)};
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
  LinkedAccountButton
};
