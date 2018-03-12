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
  background: ${colors.bgLight};
  padding: ${dimensions.coreSpacing}px;
`;

const Title = styled.label`
  display: block;
  margin: 20px 0 10px;
`;

const CenterContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
`;

const Embedded = styled.div`
  width: 100%;
`;

const FormContainer = styled.div`
  display: block;
  position: fixed;
  border-radius: 5px;
  background-color: ${colors.colorWhite};
  width: 500px;
`;

const PopupTitle = styled.div`
  padding: 20px;
  border-radius: 5px 5px 0 0;
  background-color: ${colors.colorSecondary};
  color: ${colors.colorWhite};
  text-align: center;
`;

const PreviewBody = styled.div`
  padding: 20px;
  color: ${colors.textPrimary};
  display: flex;
  overflow: auto;

  img {
    max-width: 100px;
    margin-right: 10px;
  }

  button {
    width: 100%;
    margin-top: 20px;
  }
`;

const BodyContent = styled.div`
  flex: 1;
`;

const BodyText = styled.span`
  display: block;
  margin-bottom: 20px;
`;

const BackgroundSelector = styled.li`
  display: inline-block;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 50%;
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : 'transparent')};

  > div {
    height: 30px;
    width: 30px;
    margin: 5px;
    background: #eee;
    border-radius: 50%;
    line-height: 30px;
    border: 1px solid #edf1f5;
  }

  &:first-child {
    margin: 0;
  }
`;
const ColorPick = styled.ul`
  list-style: none;
  padding: 0;
`;

const ColorPicker = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 5px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
  margin: 0 20px 5px;
`;

const Picker = styled.div`
  width: 80px;
  height: 15px;
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
  Title,
  CenterContainer,
  FormContainer,
  PreviewBody,
  PopupTitle,
  BodyText,
  ColorPick,
  ColorPicker,
  Picker,
  BackgroundSelector,
  BodyContent,
  Embedded
};
