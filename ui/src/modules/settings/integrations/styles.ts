import { colors, dimensions } from 'modules/common/styles';
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

  > button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

const MessengerPreview = styled.div`
  width: 40%;
`;

const IntegrationName = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-left: ${dimensions.unitSpacing / 2}px;
  }
`;

const BrandName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

const Script = styled.div`
  padding-top: ${dimensions.coreSpacing}px;

  ol {
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

const Options = styled.div`
  font-weight: 500;

  i {
    color: ${colors.colorCoreGray};
    margin-left: ${dimensions.unitSpacing}px;
    font-weight: normal;
  }
`;

const Description = styled.p`
  text-transform: initial;
`;

const Verify = styled.div`
  display: flex;
  align-items: center;
  margin: ${dimensions.coreSpacing}px ${dimensions.coreSpacing * 8}px
    ${dimensions.coreSpacing}px 0;

  > * {
    margin-left: ${dimensions.unitSpacing}px;
  }

  > i {
    color: ${colors.colorPrimary};
    margin: 0 ${dimensions.unitSpacing}px 0;
  }

  label {
    margin: 0;
  }
`;

const RefreshPermission = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${colors.colorSecondary};
  font-weight: 500;
  opacity: 0.8;
  transition: all ease 0.3s;

  &:hover {
    opacity: 1;
  }
`;

export {
  FlexRow,
  Row,
  MessengerPreview,
  IntegrationName,
  BrandName,
  Options,
  Description,
  Script,
  Verify,
  RefreshPermission
};
