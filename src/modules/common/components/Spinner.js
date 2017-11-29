import React from 'react';
import styled from 'styled-components';
import Rotate from '../utils/animateRotate';
import { colors } from '../styles';

const size = 26;

const Spin = styled.div`
  box-sizing: border-box;
  display: inline-block;
  vertical-align: middle;
  text-align: left;
  font-size: 0;
  margin: 40px auto;
`;

const Line = styled.div`
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
`;

const LineMask = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${size / 2}px;
  height: ${size}px;
  margin-left: -${size / 2}px;
  margin-top: -${size / 2}px;
  overflow: hidden;
  transform-origin: ${size / 2}px ${size / 2}px;
  -webkit-mask-image: -webkit-linear-gradient(top, #000000, rgba(0, 0, 0, 0));
  opacity: 0.8;

  &.one {
    animation: ${Rotate} 1.8s -1.4s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorCoreYellow};
    }
  }

  &.two {
    animation: ${Rotate} 1.6s -1s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorPrimary};
    }
  }

  &.three {
    animation: ${Rotate} 1.8s -0.5s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorCoreRed};
    }
  }

  &.four {
    animation: ${Rotate} 1.6s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorSecondary};
    }
  }
`;

function Spinner() {
  return (
    <Spin>
      <LineMask className="one">
        <Line />
      </LineMask>
      <LineMask className="two">
        <Line />
      </LineMask>
      <LineMask className="three">
        <Line />
      </LineMask>
      <LineMask className="four">
        <Line />
      </LineMask>
    </Spin>
  );
}

export default Spinner;
