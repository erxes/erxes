import * as React from 'react';
import PropTypes from 'prop-types';
import { TabContainer, TabCaption } from './styles';

function Tabs(props) {
  return <TabContainer {...props} />;
}

function TabTitle(props) {
  return <TabCaption {...props} />;
}

Tabs.propTypes = {
  children: PropTypes.node,
  grayBorder: PropTypes.bool
};

TabTitle.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

export { Tabs, TabTitle };
