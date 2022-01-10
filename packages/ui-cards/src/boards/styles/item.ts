import styled from 'styled-components';
import { colors } from '@erxes/ui/src/styles';

export const PipelinePopoverContent = styled.div`
  padding: 30px 10px 10px 30px;
  width: 300px;
`;

export const HeaderContent = styled.div`
  flex: 1;
  textarea {
    border-bottom: none;
    min-height: auto;
    padding: 5px 0;
    &:focus {
      border-bottom: 1px solid ${colors.colorSecondary};
    }
  }
`;