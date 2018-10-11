import { colors, dimensions, typography } from 'modules/common/styles';
import styled from 'styled-components';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px ${dimensions.unitSpacing}px;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const FlexItem = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const DateFilters = styled.div`
  width: 305px;

  button {
    padding: 5px 20px;
  }
`;

const Actions = styled.div`
  display: flex;
  padding: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;

  button {
    margin-left: 1px;
  }
`;

const SectionContainer = styled.div`
  position: relative;
  padding-bottom: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 4px 1px ${colors.shadowPrimary};

  > div {
    margin-bottom: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Name = styled.div`
  flex: 1;
  word-break: break-word;

  p {
    color: ${colors.colorCoreLightGray};
    margin: 0;
    font-size: ${typography.fontSizeHeading8}px;
  }
`;

export { FlexRow, FlexItem, DateFilters, SectionContainer, Actions, Name };
