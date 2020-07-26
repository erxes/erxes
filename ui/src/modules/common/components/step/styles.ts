import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const StepContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
  box-shadow: 0 0 4px ${colors.colorShadowGray};

  > *:nth-child(n + 2) {
    margin-left: 5px;
  }
`;

const StepWrapper = styled.div`
  margin: ${dimensions.unitSpacing}px;
  height: 100%;
  height: calc(100% - ${dimensions.unitSpacing * 2}px);
  display: flex;
  flex-direction: column;
`;

const StepItem = styledTS<{ show: boolean }>(styled.div)`
  transition: all .3s ease;
  width: ${props => (props.show ? '100%' : '60px')};
  box-shadow: 0 0 4px ${colors.colorShadowGray};
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

const FullStep = styledTS<{ show: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
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

const StepHeaderTitle = styled.h5`
  margin: 0 0 0 ${dimensions.unitSpacing}px;
`;

const StepContent = styled.div`
  width: 100%;
  height: calc(100% - 55px);
  overflow: hidden;
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
  padding: ${dimensions.coreSpacing}px;
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
  Preview
};
