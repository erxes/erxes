import React from 'react';
import PropTypes from 'prop-types';
import { TabContainer, TabCaption } from './styles';

class Tabs extends React.Component {
  render() {
    return <TabContainer {...this.props} />;
  }
}

class TabTitle extends React.Component {
  render() {
    return <TabCaption {...this.props} />;
  }
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
