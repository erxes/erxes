import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

export const QPayWrapper = styled.div`
  padding: ${dimensions.coreSpacing + dimensions.unitSpacing}px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h4 {
    padding: 0 ${dimensions.coreSpacing + dimensions.coreSpacing}px;
  }

  h5 {
    display: flex;
    align-items: center;

    .icon-wrapper {
      margin-right: ${dimensions.unitSpacing}px;
      background: ${colors.colorCoreGreen};
      color: ${colors.colorWhite};
      padding: 3px;
      border-radius: 50%;
    }
  }
`;

export const TotalAmount = styled.div`
  margin: ${dimensions.unitSpacing}px 0;

  span {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

export const InvoiceListIcon = styled.div`
  margin-left: ${dimensions.unitSpacing}px;
  border-radius: 50%;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  line-height: 25px;
  background: ${colors.borderPrimary};
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
  position: absolute;
  top: 40px;
  right: 40px;
  text-align: center;
`;

export const InvoiceList = styled.div`
  padding: 30px;
`;
