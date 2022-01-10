import { colors, dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';

const MainInfo = styled.div`
  overflow: hidden;

  > span {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

export {
  MainInfo,
};
