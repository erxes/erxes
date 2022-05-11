import { colors, dimensions } from '../../styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const StepContainer = styledTS<{ type?: string }>(styled.div)`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
  box-shadow: ${props => !props.type && `0 0 4px ${colors.colorShadowGray}`};

  > *:nth-child(n + 2) {
    margin-left: ${props => !props.type && `5px`};
  }
`;

const StepWrapper = styledTS<{ type?: string }>(styled.div)`
  margin: ${props =>
    props.type === 'stepper'
      ? `${dimensions.coreSpacing}px`
      : `${dimensions.unitSpacing}px`};
  height: ${props => !props.type && `100%`};
  height: ${props =>
    !props.type && `calc(100% - ${dimensions.unitSpacing * 2}px)`};
  display: flex;
  flex-direction: ${props => !props.type && 'column'};
  flex: ${props => !props.type && '1'};
  justify-content: ${props => props.type === 'stepper' && 'center'};
  width: ${props => props.type === 'stepper' && '100%'};
  align-items: ${props => props.type === 'stepper' && 'center'};
  background: ${props => props.type === 'stepper' && `${colors.colorWhite}`};
`;

const StepItem = styledTS<{ show: boolean; type?: string }>(styled.div)`
  transition: ${props => !props.type && `all .3s ease`};
  width: ${props =>
    props.show ? '100%' : props.type === 'stepper' ? '0px' : '60px'};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
  justify-content: ${props => props.type === 'stepper' && 'center'};
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing / 2}px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  background: ${colors.bgLight};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
  justify-content: space-between;

  > *:nth-child(n + 2) {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const ControlWrapper = styled(TitleContainer)`
  margin-bottom: 0;
  margin-top: ${dimensions.unitSpacing / 2}px;
`;

const Indicator = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 15px;
  font-style: italic;

  strong {
    color: ${colors.textPrimary};
  }
`;

const FullStep = styledTS<{ show: boolean; type?: string }>(styled.div)`
  justify-content: ${props => props.type === 'stepper' && 'flex-start'};
  background: ${colors.colorWhite};
  height: 100%;
  width: ${props => !props.type && '100%'};
  transition: ${props => !props.type && 'all 0.3s ease'};
  display: ${props => (props.show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: ${props => props.type === 'stepper' && 'center'};
  flex: ${props => props.type === 'stepper' && '1'};
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

const StepHeaderTitle = styled.h5`
  margin: 0 0 0 ${dimensions.unitSpacing}px;
`;

const StepContent = styledTS<{ type?: string }>(styled.div)`
  width: 100%;
  height: ${props => !props.type && 'calc(100% - 55px)'};
  justify-content: ${props => props.type === 'stepper' && 'center'};
  display: ${props => props.type === 'stepper' && 'flex'};
`;

const ShortStep = styledTS<{ show: boolean }>(styled.div)`
  width: 60px;
  height: 100%;
  background: ${colors.bgLight};
  border: 1px solid ${colors.bgLight};
  cursor: pointer;
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  padding: ${dimensions.unitSpacing}px 0;
  flex-direction: column;
  transition: all 0.3s ease;
  
  img {
    filter: grayscale(100%);
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  &:hover {
    border-color: ${colors.colorCoreTeal};

    img {
      filter: grayscale(0);
      opacity: 1;
    }
  }
`;

const InlineForm = styled.div`
  display: flex;
  flex-direction: row;

  > *:not(:first-child) {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

const FlexItem = styledTS<{
  count?: string;
  overflow?: string;
  v?: string;
  h?: string;
  direction?: string;
}>(styled.div)`
  display: flex;
  height: 100%;
  border-right: 1px solid ${colors.borderPrimary};
  flex: ${props => (props.count ? props.count : 1)};
  ${props => {
    if (props.overflow) {
      return `
        overflow: ${props.overflow};
      `;
    }
    return null;
  }};
  ${props => {
    if (props.v) {
      return `
        align-items: ${props.v};
      `;
    }
    return null;
  }};
  ${props => {
    if (props.h) {
      return `
        justify-content: ${props.h};
      `;
    }
    return null;
  }};
  ${props => {
    if (props.direction) {
      return `
        flex-direction: ${props.direction};
      `;
    }
    return null;
  }};

  &:last-of-type {
    border: none;
  }
`;

const FlexPad = styled(FlexItem)`
  padding: ${dimensions.coreSpacing}px;
  flex: 1;
  border-right: ${colors.borderPrimary};
`;

const LeftItem = styledTS<{ deactive?: boolean }>(styled.div)`
  overflow: auto;
  flex: 1;
  min-width: 43.33333%;
  padding: ${dimensions.coreSpacing + 5}px;
  opacity: ${props => props.deactive && '0.3'};
  cursor: ${props => props.deactive && 'not-allowed'};

  input:disabled {
    cursor: not-allowed;
  }
`;

const Preview = styledTS<{ fullHeight?: boolean }>(styled.div)`
  flex: 1;
  border-left: 1px solid ${colors.borderPrimary};
  background: url('/images/previews/preview.png');
  background-repeat: repeat;
  background-position: center 20px;
  background-size: cover;
  height: ${props => props.fullHeight && '100%'};
  overflow: hidden;
`;

const StepCount = styledTS<{ complete?: boolean }>(styled.div)`
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 6px;
  color: ${props =>
    props.complete === true ? colors.colorWhite : colors.colorCoreBlack};
  background-color: ${props =>
    props.complete === true ? colors.colorPrimary : colors.bgActive};
`;

const SteperItem = styledTS<{ complete?: boolean }>(styled.span)`
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
    border-bottom: 2px solid ${props =>
      props.complete === true ? colors.colorPrimary : colors.bgActive};
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

const StyledButton = styledTS<{ next?: boolean }>(styled.button)`
  border: 1px solid ${colors.colorPrimary};
  border-radius: 8px;
  height:40px;
  width: 110px;
  padding: 10px 40px;
  font-weight: 500;
  margin-right: 10px;
  color: ${props =>
    props.next === true ? colors.colorWhite : colors.colorPrimary};
  background: ${props =>
    props.next === true ? colors.colorPrimary : colors.colorWhite};
`;

const ButtonContainer = styled.div`
  width: 240px;
  display: flex;
  align-items: center;
`;

const ButtonBack = styledTS<{ next?: boolean }>(styled.button)`
  border: 1px solid ${colors.colorPrimary};
  border-radius: 8px;
  height:40px;
  width: 110px;
  font-weight: 500;
  margin-right: 10px;
  color: ${props =>
    props.next === true ? colors.colorWhite : colors.colorPrimary};
  background: ${props =>
    props.next === true ? colors.colorPrimary : colors.colorWhite};
`;

export {
  StepContainer,
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep,
  StepWrapper,
  TitleContainer,
  Indicator,
  ControlWrapper,
  InlineForm,
  FlexItem,
  FlexPad,
  LeftItem,
  Preview,
  StepCount,
  SteperItem,
  StyledButton,
  ButtonContainer,
  ButtonBack
};
