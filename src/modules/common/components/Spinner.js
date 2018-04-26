import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { rotate } from 'modules/common/utils/animations';
import { colors } from '../styles';

const size = 26;

const Spin = styled.div`
  height: ${props => props.objective && '100px'};
  position: ${props => props.objective && 'relative'};
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
    animation: ${rotate} 1.8s -1.4s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorCoreYellow};
    }
  }

  &.two {
    animation: ${rotate} 1.6s -1s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorPrimary};
    }
  }

  &.three {
    animation: ${rotate} 1.8s -0.5s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorCoreRed};
    }
  }

  &.four {
    animation: ${rotate} 1.6s infinite linear;

    ${Line} {
      box-shadow: inset 0 0 0 2px ${colors.colorSecondary};
    }
  }
`;

function Spinner({ objective }) {
  return (
    <Spin objective={objective}>
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

Spinner.propTypes = {
  objective: PropTypes.bool
};

Spinner.defaultProps = {
  objective: false
};

export default Spinner;
