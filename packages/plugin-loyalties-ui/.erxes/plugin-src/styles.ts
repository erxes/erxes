import styled, { css } from 'styled-components';
import dimensions from '@erxes/ui/src/styles/dimensions';

export const LoyaltyAmount = styled.div`
  font-weight: 500;
  line-height: 20px;
  padding: 0 0 5px 15px;
  display: flex;
  position: relative;
  flex-direction: row;
  transition: all ease 0.3s;
`;

export const SettingsContent = styled.div`
  padding: 30px;
`;

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

export const PaddingTop = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
`;