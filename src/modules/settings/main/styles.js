import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { BoxRoot } from 'modules/common/styles/main';

const rowTitleSize = 230;
const boxSize = 150;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: ${dimensions.coreSpacing}px;
`;

const RowTitle = styled.h3`
  font-size: ${typography.fontSizeHeading8}px;
  font-weight: ${typography.fontWeightMedium};
  padding: 0 ${dimensions.coreSpacing * 2}px;
  text-transform: uppercase;
  align-self: center;
  margin: 0 0 ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreDarkGray};
  flex-shrink: 0;
  width: ${rowTitleSize}px;
`;

const Box = BoxRoot.extend`
  width: ${boxSize}px;
  height: ${boxSize}px;
`;

const Divider = styled.div`
  border-bottom: 1px dotted ${colors.borderDarker};
  padding-bottom: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  margin-left: ${rowTitleSize}px;
`;

const BoxName = styled.span`
  font-size: ${typography.fontSizeUppercase}px;
`;

export { Row, RowTitle, Box, Divider, BoxName };
