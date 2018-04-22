import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const BlockValue = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  margin-top: 5px;
  white-space: normal;
`;

const ButtonWrapper = styled.div`
  text-align: right;
`;

export { BlockValue, ButtonWrapper };
