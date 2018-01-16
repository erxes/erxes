import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;

const StepWrapper = styled.div`
  height: 100%;
  display: flex;
  & > *:nth-child(n + 2) {
    margin-left: 10px;
  }
`;

const Step = styled.div`
  height: 100%;
  flex: 1 100%;
  border: 1px solid ${colors.borderPrimary};
`;

const Header = styled.div`
  background: ${colors.bgLight};
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
  position: relative;

  span {
    margin-left: 10px;
  }
`;
const NextButton = styled.div`
  position: absolute;
  right: 10px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 2px;

  span {
    margin-right: 5px;
  }
`;
const HeaderNumber = styled.div`
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
  border-radius: 100%;
  text-align: center;
  line-height: 35px;
  width: 35px;
`;

const Content = styled.div`
  height: calc(100% - 50px);
  display: flex;
  flex: 1 100%;
`;

const ContentCenter = styled.div`
  height: calc(100% - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 100%;
`;

const FinishedStep = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  background: ${colors.bgLight};
  width: 60px;
  border: 1px solid ${colors.borderPrimary};
  cursor: pointer;
`;

const Divider = styled.div`
  height: 100%;
  background: ${colors.borderPrimary};
  width: 2px;
  margin: 0 10px;
`;

const Flex100 = styled.div`
  flex: 1 100%;
`;

const FlexItem = styled.div`
  display: flex;
`;

const ButtonBox = styled.div`
  cursor: pointer;
  display: block;
  padding: ${coreSpace} ${coreSpace};
  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-align: center;
  margin: 20px;
  width: 300px;

  span {
    margin-bottom: 5px;
    font-weight: bold;
  }

  p {
    margin-bottom: 0;
    color: ${colors.colorCoreLightGray};
    font-size: 12px;
  }

  &:hover {
    ${props => {
      if (!props.selected) {
        return `
          border: 1px dotted ${colors.colorSecondary};
        `;
      }
    }};
  }
`;

export {
  StepWrapper,
  Step,
  Header,
  HeaderNumber,
  NextButton,
  Content,
  ContentCenter,
  FinishedStep,
  Divider,
  Flex100,
  FlexItem,
  ButtonBox
};
