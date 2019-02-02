import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const MiddleContent = styled.div`
  width: 850px;
`;

const Box = styled.div`
  padding: ${dimensions.coreSpacing}px;
  padding-bottom: 0;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.1);
`;

const Title = styled.h4`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding-bottom: ${dimensions.unitSpacing}px;
  text-transform: uppercase;
  font-size: 16px;
  margin-top: 0;
  color: ${colors.colorPrimary};
`;

const Group = styled.div`
  display: block;
  padding-bottom: ${dimensions.coreSpacing}px;

  span {
    font-size: 15px;
    color: ${colors.textSecondary};
    padding-bottom: 5px;
    display: block;
  }
`;

export { MiddleContent, Title, Group, Box };
