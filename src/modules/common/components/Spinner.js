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

const MainLoader = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${size}px;
  height: ${size}px;
  margin-left: -${size / 2}px;
  margin-top: -${size / 2}px;
  animation: ${rotate} 0.75s linear infinite;
  border: 2px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
  border-right-color: ${colors.colorSecondary};
  border-radius: 100%;
`;

function Spinner({ objective }) {
  return (
    <Spin objective={objective}>
      <MainLoader />
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
