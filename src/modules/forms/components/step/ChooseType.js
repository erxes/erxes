import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CalloutPreview } from './preview';
import { FormGroup, ControlLabel } from 'modules/common/components';
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
  transition: all 0.25s ease;
  width: 50%;
  margin-right: 20px;
  margin-bottom: 20px;

  img {
    width: 40px;
    transition: all 0.5s ease;
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
  renderBox(name, image, value) {
    const { __ } = this.context;

    return (
      <Box
        selected={this.props.type === value}
        onClick={() => this.onChange(value)}
      >
        <img src={image} alt={name} />
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
            {this.renderBox(
              'ShoutBox',
              '/images/icons/icon-01.svg',
              'shoutbox'
            )}
            {this.renderBox('Popup', '/images/icons/icon-02.svg', 'popup')}
          </BoxRow>

          <BoxRow>
            {this.renderBox(
              'Embedded',
              '/images/icons/icon-03.svg',
              'embedded'
            )}
            {this.renderBox(
              'Dropdown',
              '/images/icons/icon-04.svg',
              'dropdown'
            )}
          </BoxRow>

          <BoxRow>
            {this.renderBox(
              'Slide-in Left',
              '/images/icons/icon-05.svg',
              'slideInLeft'
            )}
            {this.renderBox(
              'Slide-in Right',
              '/images/icons/icon-06.svg',
              'slideInRight'
            )}
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
