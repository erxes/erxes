import { Component } from 'react';
import PropTypes from 'prop-types';

class ContentWithPermission extends Component {
  render() {
    const { action, children } = this.props;
    const { can } = this.context;

    if (!can(action)) return null;

    return children;
  }
}

ContentWithPermission.propTypes = {
  action: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

ContentWithPermission.contextTypes = {
  can: PropTypes.func.isRequired
};

export default ContentWithPermission;
