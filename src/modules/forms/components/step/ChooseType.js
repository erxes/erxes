import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CalloutPreview } from './preview';
import { FormGroup, ControlLabel, Icon } from 'modules/common/components';
import { FlexItem, BoxRow, Box } from './style';
import { LeftItem, Preview } from 'modules/common/components/step/styles';

const propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  calloutTitle: PropTypes.string,
  calloutBtnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string
};

class ChooseType extends Component {
  renderBox(name, icon, value) {
    const { __ } = this.context;

    return (
      <Box
        selected={this.props.type === value}
        onClick={() => this.onChange(value)}
      >
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  onChange(value) {
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
            {this.renderBox('ShoutBox', 'speech-bubble-3', 'shoutbox')}
            {this.renderBox('Popup', 'expand', 'popup')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Embedded', 'computer', 'embedded')}
            {this.renderBox('Dropdown', 'downarrow', 'dropdown')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Slide-in Left', 'logout-2', 'slideInLeft')}
            {this.renderBox('Slide-in Right', 'logout-1', 'slideInRight')}
          </BoxRow>
        </LeftItem>
        <Preview>
          <CalloutPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

ChooseType.propTypes = propTypes;
ChooseType.contextTypes = {
  __: PropTypes.func
};

export default ChooseType;
