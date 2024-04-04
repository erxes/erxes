import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 96%;
  margin: 0 auto;
`;

export const LittleGroup = styled.div`
  padding: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;
