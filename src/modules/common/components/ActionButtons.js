import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  children: PropTypes.node.isRequired
};

const ActionButton = styled.div`
  min-width: 70px;

  button,
  a {
    padding: 0;
    margin-left: 16px;
  }
`;

function ActionButtons({ children }) {
  return <ActionButton>{children}</ActionButton>;
}

ActionButtons.propTypes = propTypes;

export default ActionButtons;
