import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

const IntegrationName = styled.span`
  margin-right: ${dimensions.unitSpacing}px;
`;

const BrandName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

export { IntegrationName, BrandName };
