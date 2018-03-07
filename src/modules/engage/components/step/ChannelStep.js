import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BoxRoot, FullContent } from 'modules/common/styles/styles';
import { colors } from 'modules/common/styles';
import { METHODS } from 'modules/engage/constants';

const boxSize = 320;

const Box = BoxRoot.extend`
  width: ${boxSize}px;
  padding: 40px;

  &:last-of-type {
    margin-right: 0;
  }

  span {
    text-transform: capitalize;
    font-weight: 500;
  }

  ${props => {
    if (props.selected) {
      return `
        border: 1px solid ${colors.colorSecondary};
      `;
    }
  }};

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }
`;

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
        <img src={image} alt={name} />
        <span>{__(name)}</span>
        <p>{__(desc)}</p>
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
