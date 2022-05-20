import styled from 'styled-components';
import { ReceiptWrapper } from '../orders/components/receipt/styles';

export const ReceiptWrapperReport = styled(ReceiptWrapper)`
  margin-top: 10px;
`;

export const MainGroup = styled.div`
  border-bottom: 1px dashed #666;
  width: 100%;
`;

export const GroupUser = styled.div`
  border-bottom: 1px solid #666;
  width: 100%;
  font-weight: bold;
`;

export const Amounts = styled.div`
  p {
    display: flex;
    justify-content: space-between;
    padding-left: 50px;
  }
  span {
    text-align: right;
  }
`;

export const GroupCategory = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px dashed #666;
  font-weight: 500;
`;

export const Products = styled.div`
  p {
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
  }
  span {
    text-align: right;
  }
`;
