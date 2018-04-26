import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

const StepWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing / 2}px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};

  > *:nth-child(n + 2) {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

export { StepWrapper, TitleContainer };
