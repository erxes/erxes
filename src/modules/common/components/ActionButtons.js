import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  children: PropTypes.node
};

const ActionButton = styled.div`
  display: inline-block;

  * {
    padding: 0;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

function ActionButtons({ children }) {
  return <ActionButton>{children}</ActionButton>;
}

ActionButtons.propTypes = propTypes;

export default ActionButtons;
