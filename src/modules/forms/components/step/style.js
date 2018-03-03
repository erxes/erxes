import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const StepItem = styled.div`
  transition: all 0.3s;
  width: ${props => (props.show ? '100%' : '70px')};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
`;

const FullStep = styled.div`
  background: ${colors.colorWhite};
  height: 100%;
  width: 100%;
  transition: all 0.3s;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const StepHeaderContainer = styled.div`
  height: 55px;
  padding: 0 ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
`;

const StepImg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  width: 35px;
  > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const StepHeaderTitle = styled.div`
  margin-left: 10px;
`;

const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  overflow: hidden;
`;

const ShortStep = styled.div`
  width: 70px;
  height: 100%;
  background: ${colors.bgLight};
  cursor: pointer;
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  padding: 10px 0;
  flex-direction: column;
`;

const StepStatus = styled.div`
  margin-top: 20px;
`;

const FlexItem = styled.div`
  display: flex;
  flex-direction: row;
  overflow: auto;
  height: 100%;
`;

const LeftItem = styled.div`
  min-width: 600px;
  padding: ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.bgMain};
  padding: ${dimensions.coreSpacing}px;
`;

const Title = styled.label`
  display: block;
  margin: 20px 0 10px;
`;

export {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep,
  StepStatus,
  FlexItem,
  LeftItem,
  Preview,
  Title
};
