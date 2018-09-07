import * as React from 'react';
import PropTypes from 'prop-types';
import { ContentHeader, HeaderItems } from '../styles';

const propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
  background: PropTypes.string
};

function ActionBar({ left, right, background }) {
  return (
    <ContentHeader background={background || 'bgLight'}>
      {left && <HeaderItems>{left}</HeaderItems>}
      {right && <HeaderItems rightAligned>{right}</HeaderItems>}
    </ContentHeader>
  );
}

ActionBar.propTypes = propTypes;

export default ActionBar;
