import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles'

const StepWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
  align-items: center;
  background: ${colors.colorWhite};
`;

const StepItem = styledTS<{complete?: boolean}>(styled.span)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  z-index: 5;
  justify-content: center;
  max-width: 400px;
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

export { StepCount, StepItem, StepWrapper};