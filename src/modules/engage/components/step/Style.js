import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const StepWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding: 10px;
  background: ${colors.colorWhite};

  > *:nth-child(n + 2) {
    margin-left: 10px;
  }
`;

const StepContainer = styled.div`
  display: flex;
  height: 100%;
  > *:nth-child(n + 2) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const StepItem = styled.div`
  transition: all 0.3s;
  width: ${props => (props.show ? '100%' : '70px')};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
`;

const FullStep = styled.div`
  background: ${colors.bgLight};
  height: 100%;
  width: 100%;
  transition: all 0.3s;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const StepHeaderContainer = styled.div`
  height: 55px;
  padding: 0 ${dimensions.unitSpacing}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
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

const StepHeaderTitle = styled.div`
  margin-left: 10px;
`;

const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  padding: ${dimensions.unitSpacing}px;
`;

const ShortStep = styled.div`
  width: 70px;
  height: 100%;
  background: ${colors.bgLight};
  cursor: pointer;
  display: ${props => (props.show ? 'flex' : 'none')};
  justify-content: center;
  padding: 10px 0;
`;

const ContentCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin: 20px;
  padding: 20px;
  border-radius: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 350px;

  > span {
    margin-bottom: 5px;
    font-weight: bold;
  }
  > div {
    display: flex;
    align-items: center;
  }
  img {
    height: 50px;
    margin-right: 10px;
  }
  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};

  p {
    margin: 0;
    color: ${colors.colorCoreLightGray};
    font-size: 12px;
  }

  &:hover {
    ${props => {
      if (!props.selected) {
        return `
          border: 1px solid ${colors.colorSecondary};
        `;
      }
    }};
  }
`;

export {
  StepWrapper,
  TitleContainer,
  StepContainer,
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepNumber,
  StepHeaderTitle,
  StepContent,
  ShortStep,
  ContentCenter,
  ButtonBox
};
