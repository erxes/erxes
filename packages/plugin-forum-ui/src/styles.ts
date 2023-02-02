import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '@erxes/ui/src/styles/colors';
import { dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';

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

export const Reply = styled.div`
  margin-left: ${dimensions.coreSpacing * 2}px;
`;

export const Thumbnail = styled.img`
  max-height: 400px;
`;

export const StepItem = styled.div`
  box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 5px 0;
  border-radius: 2px;
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;

export const StepHeader = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: 15px 30px;
  position: relative;
  background: ${colors.bgLight};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  font-weight: 500;
`;

export const StepBody = styled.div`
  padding: 20px 30px 30px 30px;
  background: ${colors.colorWhite};

  > div:last-of-type {
    margin: 0;
  }
`;

export const Divider = styled.div`
  border-bottom: 1px dotted ${rgba(colors.colorPrimary, 0.5)};
  padding-bottom: ${dimensions.unitSpacing}px;
  margin: 0 0 ${dimensions.coreSpacing}px 0px;
`;
