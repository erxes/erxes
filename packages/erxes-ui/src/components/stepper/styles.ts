import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles'

const StepWrapper = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 800px;
  align-items: center;
`;

const StepItem = styled.span`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  z-index: 5;
  justify-content: center;
  width: 40px;
  height: 80px;
  border-radius: 50%; 
  margin-bottom: 6px;

  &.active {
    font-weight: bold;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }

  &:before {
    position: absolute;
    border-bottom: 2px solid #4bb543;
    width: 100%;
    top: 25px;
    left: -50%;
    z-index: 2;
  }

  &:after {
    position: absolute;
    content: "";
    border-bottom: 2px solid #4bb543;
    width: 100%;
    top: 25px;
    left: 50%;
    z-index: 2;
  }  

  &.completed {
    background-color: #4bb543;

    &:after {
      position: absolute;
    content: "";
    border-bottom: 2px solid #4bb543;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 6px;
  background-color: ${props => props.complete === true ? colors.colorCoreGreen : colors.colorShadowGray};
`;

export { StepCount, StepItem, StepWrapper};