import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

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

export { FlexRow, Row, MessengerPreview, IntegrationName, BrandName };
