import colors from '@erxes/ui/src/styles/colors';
import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ExtraRow = styledTS<{ isDefault?: boolean }>(styled.tr)`
  background: ${(props) => (props.isDefault ? '' : '#F7F8FC')};
`;

const ScoringBox = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

  > div {
    margin-bottom: ${dimensions.unitSpacing - 2}px;
    display: flex;
    align-items: center;
    
    > span {
      min-width: 300px;
      color: ${colors.colorCoreGray};
      display: block;
    }
  }
`;

export { ExtraRow, ScoringBox};
