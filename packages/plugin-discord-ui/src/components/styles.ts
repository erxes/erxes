import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const ConversationWrapper = styled.div`
  height: 100%;
  overflow: auto;
  min-height: 100px;
  background: ${colors.bgLight};
`;

export const RenderConversationWrapper = styled.div`
  padding: 20px;
  overflow: hidden;
  min-height: 100%;
  > div:first-child {
    margin-top: 0;
  }
`;
