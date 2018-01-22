import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepWrapper,
  ShortStep,
  StepNumber,
  FullStep,
  StepHeader,
  NextButton,
  StepContent
} from './step/Style.js';
import { Icon } from 'modules/common/components';
import Step1 from './step/Step1';
import Step2 from './step/Step2';
import Step3 from './step/Step3';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  brands: PropTypes.array,
  counts: PropTypes.object,
  users: PropTypes.array
};

const ButtonContainer = styled.div`
  position: absolute;
  right: 10px;
  display: flex;

  > *:nth-child(n + 2) {
    margin-left: 20px;
  }
`;

const ActionButton = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 2px;
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
`;

class Step extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      method: 'email',
      title: '',
      segment: '',
      message: '',
      fromUser: '',
      messenger: {
        brandId: '',
        kind: '',
        sentAs: ''
      },
      email: {
        templateId: '',
        subject: ''
      }
    };
    this.changeMethod = this.changeMethod.bind(this);
    this.changeSegment = this.changeSegment.bind(this);
    this.changeMessenger = this.changeMessenger.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.changeMessage = this.changeMessage.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      segmentId: this.state.segment,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: this.state.method
    };

    if (this.state.method === 'email') {
      doc.email = {
        templateId: this.state.email.templateId,
        subject: this.state.email.subject,
        content: this.state.message
      };
    } else if (this.state.method === 'messenger') {
      doc.messenger = {
        brandId: this.state.messenger.brandId,
        kind: this.state.messenger.kind,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    }

    return doc;
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
  }

  changeMessenger(messenger) {
    this.setState({ messenger });
  }

  changeEmail(email) {
    this.setState({ email });
  }

  changeMessage(message) {
    this.setState({ message });
  }

  changeMethod(method) {
    this.setState({ method });
  }

  changeSegment(segment) {
    this.setState({ segment });
  }

  showStep(step) {
    this.setState({ step });
  }

  saveLive(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: true, isDraft: false, ...doc });
  }

  saveDraft(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: false, isDraft: true, ...doc });
  }

  renderStep(step, hasNext, content) {
    let next = '';

    next = (
      <ButtonContainer>
        <ActionButton onClick={e => this.saveLive(e)}>Save & Live</ActionButton>
        <ActionButton onClick={e => this.saveDraft(e)}>
          Save & Draft
        </ActionButton>
      </ButtonContainer>
    );

    if (hasNext) {
      next = (
        <NextButton onClick={() => this.showStep(step + 1)}>
          <span>Next</span>
          <Icon icon="ios-arrow-forward" />
        </NextButton>
      );
    }

    if (this.state.step === step) {
      return (
        <FullStep>
          <StepHeader>
            <StepNumber>{step}</StepNumber>
            {next}
          </StepHeader>
          <StepContent>{content}</StepContent>
        </FullStep>
      );
    }

    return (
      <ShortStep onClick={() => this.showStep(step)}>
        <StepNumber>{step}</StepNumber>
      </ShortStep>
    );
  }

  render() {
    return (
      <StepWrapper>
        {this.renderStep(
          1,
          true,
          <Step1 changeMethod={this.changeMethod} method={this.state.method} />
        )}
        {this.renderStep(
          2,
          true,
          <Step2
            changeSegment={this.changeSegment}
            segments={this.props.segments}
            counts={this.props.counts}
          />
        )}
        {this.renderStep(
          3,
          false,
          <Step3
            brands={this.props.brands}
            changeMessenger={this.changeMessenger}
            changeEmail={this.changeEmail}
            changeMessage={this.changeMessage}
            message={this.state.message}
            changeUser={this.changeUser}
            users={this.props.users}
            method={this.state.method}
            templates={this.props.templates}
          />
        )}
      </StepWrapper>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
