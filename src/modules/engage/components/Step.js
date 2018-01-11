import React from 'react';
import PropTypes from 'prop-types';
import Step1 from './step1/Step1';
import Step2 from './step1/Step2';
import Step3 from './step1/Step3';
import FormBase from './FormBase';
import { StepWrapper } from './step1/Style';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  brands: PropTypes.array,
  counts: PropTypes.object
};

class Step extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message || {};

    this.state = {
      step: 1,
      message,
      method: message.method || 'email',
      chosenSegment: message.segmentId || '',
      emailContent: '',
      messengerContent: '',
      fromUser: message.fromUserId || ''
    };

    this.changeMethod = this.changeMethod.bind(this);
    this.changeStep = this.changeStep.bind(this);
    this.onChangeSegments = this.onChangeSegments.bind(this);
    this.onEmailContentChange = this.onEmailContentChange.bind(this);
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
  }

  getChildContext() {
    return {
      method: this.state.method,
      chosenSegment: this.state.chosenSegment
    };
  }

  onEmailContentChange(content) {
    this.setState({ emailContent: content });
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  changeMethod(method) {
    this.setState({ method });
  }

  onChangeSegments(value) {
    this.setState({ chosenSegment: value });
  }

  changeStep(value) {
    this.setState({ step: value });
  }

  renderContent() {
    console.log(this.state.step);
    return (
      <StepWrapper>
        <Step1
          changeStep={this.changeStep}
          changeMethod={this.changeMethod}
          finished={this.state.step === 1}
        />
        <Step2
          changeStep={this.changeStep}
          onChangeSegments={this.onChangeSegments}
          segments={this.props.segments}
          message={this.props.message}
          counts={this.props.counts}
          finished={this.state.step == 2}
        />
        <Step3
          changeStep={this.changeStep}
          changeMethod={this.changeMethod}
          templates={this.props.templates}
          message={this.props.message}
          brands={this.props.brands}
          onEmailContentChange={this.onEmailContentChange}
          onMessengerContentChange={this.onMessengerContentChange}
          finished={this.state.step == 3}
          fromUser={this.state.fromUser}
        />
      </StepWrapper>
    );
  }
}

Step.childContextTypes = {
  method: PropTypes.string,
  chosenSegment: PropTypes.string
};

Step.propTypes = propTypes;

export default Step;
