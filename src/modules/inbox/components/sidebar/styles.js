import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';

const RightItems = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-right: 10px;
  }

  button {
    padding: 5px 12px;
  }
`;

const LeftItem = styled.div`
  label {
    margin: 0;
  }
`;

const LoaderWrapper = styled.div`
  padding: 20px;
`;

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

export { RightItems, LeftItem, LoaderWrapper, FlexRow, FlexItem, DateFilters };
