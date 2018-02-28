import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ChooseType, SegmentStep, MessageStep, Steps, Step } from './step';
import { StepWrapper } from '../styles';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  integrationsCount: PropTypes.number.isRequired,
  loading: PropTypes.bool
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1,
      maxStep: 3,
      validate: {
        step1: false,
        step2: true,
        step3: true
      }
    };
  }

  render() {
    const { activeStep, maxStep } = this.state;

    const breadcrumb = [{ title: 'Forms', link: '/forms' }, { title: 'Flow' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <Steps maxStep={maxStep} active={activeStep} validate="true">
          <Step
            img="/images/icons/erxes-05.svg"
            title="Choose a flow type"
            next={this.next}
          >
            <ChooseType
              changeMethod={this.changeState}
              method={this.state.method}
            />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <SegmentStep
              changeSegment={this.changeState}
              segments="123"
              counts={10}
              count={7}
              segment={this.state.segment}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save}
            next={this.next}
            message="haha"
          >
            <MessageStep
              brands="brand"
              changeState={this.changeState}
              method={this.state.method}
              defaultValue="hah"
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
