import { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

class ShowContent extends Component {
  render() {
    const { show, children } = this.props;

    if (!show) return null;

    return children;
  }
}

ShowContent.propTypes = propTypes;
ShowContent.defaultProps = { show: false };

export default ShowContent;
