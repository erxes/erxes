import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { CommonPreview } from './';
import {
  LeftItem,
  Preview,
  FlexItem
} from 'modules/common/components/step/styles';
import { SubHeading } from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func,
  color: PropTypes.string,
  wallpaper: PropTypes.string,
  logoPreviewStyle: PropTypes.object,
  logoPreviewUrl: PropTypes.string,
  welcomeMessage: PropTypes.string,
  awayMessage: PropTypes.string,
  thankYouMessage: PropTypes.string
};

class Intro extends Component {
  constructor(props) {
    super(props);

    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    this.props.onChange(e.target.name, e.target.value);
  }

  render() {
    const { __ } = this.context;

    return (
      <FlexItem>
        <LeftItem>
          <SubHeading>{__('Online messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Welcome message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Welcome message.')}
              rows={3}
              name="welcomeMessage"
              value={this.props.welcomeMessage}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <SubHeading>{__('Offline messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Away message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Away message.')}
              rows={3}
              name="awayMessage"
              value={this.props.awayMessage}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message.')}
              rows={3}
              name="thankYouMessage"
              value={this.props.thankYouMessage}
              onChange={this.onInputChange}
            />
          </FormGroup>
        </LeftItem>
        <Preview>
          <CommonPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

Intro.propTypes = propTypes;
Intro.contextTypes = {
  __: PropTypes.func
};

export default Intro;
