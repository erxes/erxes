import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const StepWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StepContainer = styled.div`
  display: flex;
  height: 100%;
  > *:nth-child(n + 2) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const StepTitle = styled.div`
  background: ${colors.colorWhite};
  padding: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const StepHeaderContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StepHeader = styled.div`
  height: 55px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const StepHeaderTitle = styled.div`
  margin-left: 10px;
`;

const ShortStep = styled.div`
  width: 70px;
  height: 100%;
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  cursor: pointer;
  justify-content: center;
  padding: 10px 0;
  display: ${props => (props.show ? 'flex' : 'none')};
`;

const StepNumber = styled.div`
  background: ${colors.colorPrimaryDark};
  color: ${colors.colorWhite};
  border-radius: 100%;
  text-align: center;
  line-height: 35px;
  height: 35px;
  width: 35px;
`;

const StepItem = styled.div`
  transition: all 0.3s;
  width: ${props => (props.show ? '100%' : '70px')};
`;

const FullStep = styled.div`
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  height: 100%;
  width: 100%;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  padding: 10px;
  overflow: auto;
`;

export {
  StepContainer,
  StepWrapper,
  StepTitle,
  StepHeaderContainer,
  StepHeaderTitle,
  ShortStep,
  StepNumber,
  FullStep,
  StepHeader,
  StepContent,
  StepItem
};
