import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { BoxRoot, FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { METHODS } from 'modules/engage/constants';
import React from 'react';
import styled from 'styled-components';

const Box = styled(BoxRoot)`
  width: 320px;
  padding: 40px;
  background: ${colors.bgLight};

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
    min-height: 36px;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

type Props = {
  onChange: (name: 'method', value: string) => void;
  method: string;
};

class ChannelStep extends React.Component<Props> {
  renderBox(name, icon, desc) {
    const onClick = () => this.props.onChange('method', name);

    return (
      <Box selected={this.props.method === name} onClick={onClick}>
        <Icon icon={icon} />
        <span>{__(name)}</span>
        <p>{__(desc)}</p>
      </Box>
    );
  }

  render() {
    return (
      <FullContent center={true}>
        {this.renderBox(
          METHODS.EMAIL,
          'envelope-edit',
          `Master email marketing with fully customized templates`
        )}
        {this.renderBox(
          METHODS.MESSENGER,
          'comment-edit',
          'Interact personally with direct in-app-messaging'
        )}
        {this.renderBox(
          METHODS.SMS,
          'comment-alt-message',
          `Send bulk SMS online with simple and direct texts`
        )}
      </FullContent>
    );
  }
}

export default ChannelStep;
