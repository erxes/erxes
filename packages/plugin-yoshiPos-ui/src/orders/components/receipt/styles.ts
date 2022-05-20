import styled from 'styled-components';
import { colors } from 'modules/common/styles';

export const HeaderWrapper = styled.div`
  .receipt-logo {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    text-align: center;
    align-items: center;
  }

  h5 {
    font-size: 16px;
    margin: 0;
    padding-left: 10px;
  }

  h2 {
    font-size: 16px;
    margin: 0;
    padding-left: 25px;
  }
`;

export const ReceiptWrapper = styled(HeaderWrapper)`
  width: 72mm;
  padding: 10px;
  color: #000;
  background-color: ${colors.colorWhite};
  font-size: 11px;
  overflow: auto .block {
    border-bottom: 1px dashed #666;
    padding-bottom: 5px;
    margin-bottom: 3px;
  }

  img {
    max-width: 100%;
    max-height: 120px;
  }

  p {
    font-size: 11px;
    margin-bottom: 0;
  }

  b {
    font-weight: 500;
    margin-right: 3px;
  }

  button {
    flex: 1;
    padding: 4px 15px;
  }

  .text-center {
    text-align: center;
  }

  table {
    width: 100%;

    td {
      max-width: 100px;
      line-height: 12px;
      padding-right: 4px;
    }

    .totalCount {
      padding: 0;
      text-align: right;
    }
  }

  #qrcode {
    max-width: 150px;
    max-height: 150px;
  }
`;

export const AmountContainer = styled.div`
  p {
    display: flex;
    justify-content: space-between;
  }
`;

export const FooterWrapper = styled(AmountContainer)`
  button {
    margin-top: 15px;
  }
`;

export const Lottery = styled.div`
  display: flex-up;
`;

export const LotterySide = styled.div`
  margin-top: 10px;
  text-align: center;
  margin-left: 7px;
`;

export const LotteryCode = styled.div`
  padding-top: 10px;
`;
