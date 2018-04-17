import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CalloutPreview } from './preview';
import { FormGroup, ControlLabel, Icon } from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { FlexItem, LeftItem, Preview, BoxRow } from './style';

const Box = styled.div`
  text-align: center;
  background: ${colors.colorLightBlue};
  box-shadow: ${props =>
    props.selected && `0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}`};
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : colors.borderPrimary)};
  border-radius: ${dimensions.unitSpacing / 2}px;
  padding: ${dimensions.coreSpacing * 2}px;
  transition: all 0.3s ease;
  width: 50%;
  margin-right: 20px;
  margin-bottom: 20px;

  i {
    font-size: 36px;
    color: ${colors.colorSecondary};
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    cursor: pointer;
    box-shadow: ${props =>
      !props.selected && `0 5px 5px ${rgba(colors.colorCoreGray, 0.08)}`};
  }
`;

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
        <Icon erxes icon={icon} />
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
