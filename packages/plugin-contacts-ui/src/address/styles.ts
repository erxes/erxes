import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const AddressDetail = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  align-items: baseline;

  button {
    margin-left: ${dimensions.unitSpacing}px;
    padding: 3px 6px;
  }
`;

const AddressDetailWrapper = styled.div`
  width: 100%;
  display: flex;
  border-radius: 4px;
  border: 1px solid ${colors.borderPrimary};
`;

export { AddressDetail, AddressDetailWrapper };
