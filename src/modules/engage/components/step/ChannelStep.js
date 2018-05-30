import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FullContent } from 'modules/common/styles/main';
import { METHODS } from 'modules/engage/constants';
import { Box } from 'modules/insights/components/InsightPage';

const propTypes = {
  changeMethod: PropTypes.func,
  method: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class ChannelStep extends Component {
  renderBox(name, image, desc) {
    const { __ } = this.context;
    return (
      <Box
        selected={this.props.method === name}
        onClick={() => this.props.changeMethod('method', name)}
      >
        <a>
          <img src={image} alt={name} />
          <span>{__(name)}</span>
          <p>{__(desc)}</p>
        </a>
      </Box>
    );
  }

  render() {
    return (
      <FullContent center>
        {this.renderBox(
          METHODS.EMAIL,
          '/images/icons/erxes-07.svg',
          'Delivered to a user s email inbox Customize with your own templates'
        )}
        {this.renderBox(
          METHODS.MESSENGER,
          '/images/icons/erxes-08.svg',
          'Delivered inside your app Reach active users'
        )}
      </FullContent>
    );
  }
}

ChannelStep.propTypes = propTypes;
ChannelStep.contextTypes = contextTypes;

export default ChannelStep;
