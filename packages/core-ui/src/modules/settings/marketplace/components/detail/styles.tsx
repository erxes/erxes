import { colors, dimensions } from 'modules/common/styles';

import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Container = styled.div`
  padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px
    ${dimensions.coreSpacing}px;
`;
