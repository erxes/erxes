import { colors, dimensions } from '@erxes/ui/src/styles';
import { ContentHeader } from '@erxes/ui/src';
import styled from 'styled-components';

export const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;
export const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;
export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;
