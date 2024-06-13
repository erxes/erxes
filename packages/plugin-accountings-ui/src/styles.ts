import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const Box = styled('div')`
  flex: 1;
  padding: ${dimensions.unitSpacing * 1.5}px;
  text-align: left;
  background: ${colors.colorWhite};
  margin: 10px 10px 0 0;
`;


export {
  Box,
};
