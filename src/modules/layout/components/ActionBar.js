import React from 'react';
import PropTypes from 'prop-types';
import { ContentHeader, HeaderItems } from '../styles';

const propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
  invert: PropTypes.bool
};

function ActionBar({ left, right, invert }) {
  return (
    <ContentHeader invert={invert}>
      {left && <HeaderItems>{left}</HeaderItems>}
      {right && <HeaderItems rightAligned>{right}</HeaderItems>}
    </ContentHeader>
  );
}

ActionBar.propTypes = propTypes;

export default ActionBar;
