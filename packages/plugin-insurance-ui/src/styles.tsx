import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';

const FlexRow = styled.div`
  display: flex;
  align-items: baseline;

  button {
    margin-left: ${dimensions.unitSpacing}px;
    padding: 3px 6px;
  }
`;

const FilterLabel = styled.label`
  width: 250px;
  word-wrap: break-word;
`;

const FilterContainer = styled.div`
  padding: 0 ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  margin-top: ${dimensions.unitSpacing}px;

`;

export { FlexRow, FilterLabel, FilterContainer };
