import styled, { css } from 'styled-components';
import { Formgroup } from '@erxes/ui/src/components/form/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';
import React from 'react';

const SidebarContent = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
    ${dimensions.unitSpacing}px;
  width: 400px;
  height: 400px;
`;

// import styledTS from 'styled-components-ts';
// import { borderRadius } from './common';

const buttonColor = '#0a1e3c';

const PipelineCount = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: #666;
  margin-top: 2px;
  margin-left: 10px;
`;

export const TabContent = styled.div`
  padding: 15px 20px 0px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

export const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;
export const FlexContent = styled.div`
  display: flex;

  ${Formgroup} {
    margin-right: 20px;
  }
`;

const FlexRow = styled(FlexContent)`
  justify-content: space-between;

  > i {
    color: ${colors.colorCoreRed};
    margin-right: 5px;
  }
`;

export const Pin = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -20px 0 0 -20px;
  animation-name: bounce;
  animation-fill-mode: both;
  animation-duration: 1s;
  &::after {
    content: '';
    width: 14px;
    height: 14px;
    margin: 8px 0 0 8px;
    background: #ffffff;
    position: absolute;
    border-radius: 50%;
  }
  @keyframes bounce {
    0% {
      opacity: 0;
      transform: translateY(-2000px) rotate(-45deg);
    }
    60% {
      opacity: 1;
      transform: translateY(30px) rotate(-45deg);
    }
    80% {
      transform: translateY(-10px) rotate(-45deg);
    }
    100% {
      transform: translateY(0) rotate(-45deg);
    }
  }
`;

export const ContainerFragment = styled(React.Fragment)``;
export { PipelineCount, SidebarContent, FlexRow };
