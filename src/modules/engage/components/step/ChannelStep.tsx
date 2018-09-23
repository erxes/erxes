import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { BoxRoot, FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { METHODS } from 'modules/engage/constants';
import styledTS from 'styled-components-ts';

import React, { Component } from 'react';

const Box = styledTS<{ selected: boolean }>(BoxRoot.extend)`
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

type Props = {
  onChange: (name: 'method', value: string) => void;
  method: string;
};

class ChannelStep extends Component<Props> {
  renderBox(name, icon, desc) {
    return (
      <Box
        selected={this.props.method === name}
        onClick={() => this.props.onChange('method', name)}
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

export default ChannelStep;
