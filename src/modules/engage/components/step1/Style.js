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
`;

const HeaderNumber = styled.div`
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
  border-radius: 100%;
  text-align: center;
  line-height: 35px;
  width: 35px;
`;

const HeaderTitle = styled.div`
  margin-left: 10px;
`;

const Content = styled.div`
  height: calc(100% - 50px);
  display: flex;
  flex: 1 100%;
`;

const ContentCenter = styled.div`
  height: 100%;
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

const FlexItem = styled.div`
  flex: 1 100%;
`;

export {
  StepWrapper,
  Step,
  Header,
  HeaderNumber,
  HeaderTitle,
  Content,
  ContentCenter,
  FinishedStep,
  Divider,
  FlexItem
};
