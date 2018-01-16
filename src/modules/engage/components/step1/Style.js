import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const StepWrapper = styled.div`
  margin: 20px;
  display: flex;
  height: 100%;

  > *:nth-child(n + 2) {
    margin-left: 10px;
  }
`;

const ShortStep = styled.div`
  width: 70px;
  height: 100%;
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 10px 0;
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
const FullStep = styled.div`
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  width: 100%;
  height: 100%;
`;
const StepHeader = styled.div`
  height: 55px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
  position: relative;
`;
const NextButton = styled.div`
  position: absolute;
  right: 10px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 2px;
  transition: all 0.3s ease;

  span {
    margin-right: 5px;
  }

  &:hover {
    background: ${colors.colorPrimaryDark};
    color: ${colors.colorWhite};
  }
`;
const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  margin: 10px;
`;

export {
  StepWrapper,
  ShortStep,
  StepNumber,
  FullStep,
  StepHeader,
  NextButton,
  StepContent
};
