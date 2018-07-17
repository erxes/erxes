import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'modules/common/components';
import { FullContent, BoxRoot } from 'modules/common/styles/main';
import { METHODS } from 'modules/engage/constants';
import { colors } from 'modules/common/styles';

const Box = BoxRoot.extend`
  width: 320px;
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : colors.borderPrimary)};
  padding: 40px;

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }

  &:last-of-type {
    margin-right: 0;
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
  renderBox(name, icon, desc) {
    const { __ } = this.context;
    return (
      <Box
        static
        selected={this.props.method === name}
        onClick={() => this.props.changeMethod('method', name)}
      >
        <Icon icon={icon} />
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
          'email-1',
          'Delivered to a user s email inbox Customize with your own templates'
        )}
        {this.renderBox(
          METHODS.MESSENGER,
          'chat',
          'Delivered inside your app Reach active users'
        )}
      </FullContent>
    );
  }
}

ChannelStep.propTypes = propTypes;
ChannelStep.contextTypes = contextTypes;

export default ChannelStep;
