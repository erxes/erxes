import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Box, BoxRow, FlexItem } from './style';

type Props = {
  type: string;
  onChange: (name: 'type', value: string) => void;
  calloutTitle?: string;
  calloutBtnText?: string;
  color: string;
  theme: string;
};

class ChooseType extends React.Component<Props, {}> {
  renderBox(name: string, icon: string, value: string) {
    const onClick = () => this.onChange(value);

    return (
      <Box selected={this.props.type === value} onClick={onClick}>
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  onChange(value: string) {
    return this.props.onChange('type', value);
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Choose a flow type</ControlLabel>
          </FormGroup>
          <BoxRow>
            {this.renderBox('ShoutBox', 'comment-1', 'shoutbox')}
            {this.renderBox('Popup', 'window', 'popup')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Embedded', 'focus', 'embedded')}
            {this.renderBox('Dropdown', 'arrow-from-top', 'dropdown')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Slide-in Left', 'arrow-from-right', 'slideInLeft')}
            {this.renderBox(
              'Slide-in Right',
              'left-arrow-from-left',
              'slideInRight'
            )}
          </BoxRow>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default ChooseType;
