import { dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';

export const LoyaltyAmount = styled.div`
  font-weight: 800;
  line-height: 20px;
  padding-left: 15px;
  display: flex;
  position: relative;
  flex-direction: row;
  transition: all ease 0.3s;
`;

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;
