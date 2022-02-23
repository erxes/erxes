import { dimensions, colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const GroupWrapper = styled.div`
  border: 1px solid ${colors.colorSecondary};
  position: relative;
  border-radius: ${dimensions.unitSpacing - 5}px;
  padding: ${dimensions.unitSpacing}px 15px;
  margin-bottom: ${dimensions.coreSpacing}px;

  > button {
    position: absolute;
    padding: 5px 8px;
    top: -${dimensions.unitSpacing - 5}px;
    right: -${dimensions.unitSpacing}px;
    background: ${colors.bgActive} !important;
  }
`;
