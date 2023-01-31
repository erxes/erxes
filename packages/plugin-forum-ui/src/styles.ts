import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '@erxes/ui/src/styles/colors';
import { dimensions } from '@erxes/ui/src/styles';

export const CommentContainer = styled.div`
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.coreSpacing}px;
  border-radius: 5px;
  margin-top: ${dimensions.coreSpacing}px;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

export const CommentForm = styledTS<{ isReply?: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${props =>
    props.isReply
      ? `${dimensions.coreSpacing}px 0 0 0`
      : `${dimensions.coreSpacing}px 0`};
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 5px;
  
  input {
    border-bottom: none;
  }
`;

export const CommentSection = styled.div`
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
`;
