import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Step, Steps, FormControl } from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { Intro } from './messengerO';

class CreateMessenger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const { activeStep, title } = this.state;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') },
      { title: __('Messenger') }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required
            onChange={e => this.onChange('title', e.target.value)}
            defaultValue={title}
          />
        </TitleContainer>
        <Steps active={activeStep}>
          <Step img="/images/icons/erxes-16.svg" title="Intro">
            <Intro onChange={this.onChange} />
          </Step>
          <Step img="/images/icons/erxes-12.svg" title="Contact preperence">
            <div>hi2</div>
          </Step>
          <Step img="/images/icons/erxes-04.svg" title="Hours & Availability">
            <div>hi3</div>
          </Step>
          <Step img="/images/icons/erxes-06.svg" title="Appearance">
            <div>hi4</div>
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

CreateMessenger.contextTypes = {
  __: PropTypes.func
};

export default CreateMessenger;
