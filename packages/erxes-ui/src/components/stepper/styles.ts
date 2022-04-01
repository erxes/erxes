import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles'

const StepWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  background: ${colors.colorWhite};
`;

const SteperItem = styledTS<{complete?: boolean}>(styled.span)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  z-index: 5;
  justify-content: center;
  max-width: 400px;
  height: 80px;
  margin-bottom: 6px;
  &.active {
    font-weight: bold;
  }
  @media (max-width: 768px) {
    font-size: 12px;
  }
  &:before {
    position: absolute;
    border-bottom: 2px solid ${colors.bgActive};
    width: 100%;
    top: 30px;
    left: -50%;
    z-index: 2;
  }
  &:after {
    position: absolute;
    content: "";
    border-bottom: 2px solid ${props => props.complete === true ? colors.colorPrimary : colors.bgActive};
    width: 100%;
    top: 30px;
    left: 50%;
    z-index: 2;
  }  
  &.completed {
    background-color: ${colors.colorPrimary};
    &:after {
      position: absolute;
    content: "";
    border-bottom: 2px solid ${colors.colorPrimary};
    width: 100%;
    top: 20px;
    left: 50%;
    z-index: 3;
    }
  }
  &:first-child::before {
    content: none;
  }
  &:last-child::after {
    content: none;
  }
`;

const StepCount = styledTS<{complete?: boolean}>(styled.div)`
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 6px;
  color: ${props => props.complete === true ? colors.colorWhite : colors.colorCoreBlack};
  background-color: ${props => props.complete === true ? colors.colorPrimary : colors.bgActive};
`;

const StepContainer = styled.div`
display: flex;
flex: 1;
height: 100%;
overflow: auto;
`;
  
const FullStep = styledTS<{ show: boolean }>(styled.div)`
  justify-content: flex-start;
  background: ${colors.colorWhite};
  height: 100%;
  display: ${props => (props.show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const StepContent = styled.div`
  width: 100%;
  overflow: hidden;
  justify-content: center;
  display: flex;
`;

const StyledButton = styledTS<{ next?: boolean }>(styled.button)`
  border: 1px solid ${colors.colorPrimary};
  border-radius: 8px;
  height:40px;
  width: 110px;
  padding: 10px 40px;
  font-weight: 500;
  margin-right: 10px;
  color: ${props => props.next === true ? colors.colorWhite : colors.colorPrimary};
  background: ${props => props.next === true ? colors.colorPrimary : colors.colorWhite};
`;

const ButtonContainer = styled.div`
  width: 240px;
  display: flex;
  align-items: center;
`;

const StepItem = styledTS<{ show: boolean }>(styled.div)`
width: ${props => (props.show ? '100%' : '0px')};
justify-content: center;
box-shadow: 0 0 4px ${colors.colorShadowGray};
`;

const ButtonBack = styledTS<{ next?: boolean }>(styled.button)`
  border: 1px solid ${colors.colorPrimary};
  border-radius: 8px;
  height:40px;
  width: 110px;
  padding: 10px 40px;
  font-weight: 500;
  margin-right: 10px;
  color: ${props => props.next === true ? colors.colorWhite : colors.colorPrimary};
  background: ${props => props.next === true ? colors.colorPrimary : colors.colorWhite};
`;

export { 
  StepCount, 
  SteperItem, 
  StepWrapper, 
  StepContainer,
  FullStep,
  StepContent,
  StyledButton,
  ButtonContainer,
  StepItem,
  ButtonBack
};