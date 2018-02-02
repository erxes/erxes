import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  StepWrapper,
  TitleContainer,
  StepContainer,
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepNumber,
  StepHeaderTitle,
  StepContent,
  ShortStep
} from './step/Style';
import { FormControl, Button } from 'modules/common/components';
import Step1 from './step/Step1';
import Step2 from './step/Step2';
import Step3 from './step/Step3';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  brands: PropTypes.array,
  counts: PropTypes.object,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string
};

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

  changeTitle(title) {
    this.setState({ title });
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

  renderStep(step, title, hasNext, content) {
    let next = (
      <Button.Group>
        <Button
          btnStyle="warning"
          size="small"
          icon="plus"
          onClick={e => this.saveDraft(e)}
        >
          Save & Draft
        </Button>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus"
          onClick={e => this.saveLive(e)}
        >
          Save & Live
        </Button>
      </Button.Group>
    );

    if (hasNext) {
      next = (
        <Button
          btnStyle="default"
          size="small"
          icon="ios-arrow-forward"
          onClick={() => this.showStep(step + 1)}
        >
          Next
        </Button>
      );
    }

    let show = false;

    if (this.state.step === step) {
      show = true;
    }

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepNumber>{step}</StepNumber>
              <StepHeaderTitle>{title}</StepHeaderTitle>
            </StepHeader>
            {next}
          </StepHeaderContainer>
          <StepContent>{content}</StepContent>
        </FullStep>
        <ShortStep show={!show} onClick={() => this.showStep(step)}>
          <StepNumber>{step}</StepNumber>
        </ShortStep>
      </StepItem>
    );
  }

  renderTitle() {
    const { kind } = this.props;

    if (kind === 'auto') {
      return 'Auto message';
    } else if (kind === 'manual') {
      return 'Manual message';
    }

    return 'Visitor auto message';
  }

  render() {
    const breadcrumb = [
      { title: 'Engage', link: '/engage' },
      { title: this.renderTitle() }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <TitleContainer>
          <div>Title</div>
          <FormControl round onChange={e => this.changeTitle(e.target.value)} />
        </TitleContainer>
        <StepContainer>
          {this.renderStep(
            1,
            'Choose email',
            true,
            <Step1
              changeMethod={this.changeMethod}
              method={this.state.method}
            />
          )}
          {this.renderStep(
            2,
            'Choose segment',
            true,
            <Step2
              changeSegment={this.changeSegment}
              segments={this.props.segments}
              counts={this.props.counts}
            />
          )}
          {this.renderStep(
            3,
            'Choose template',
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
        </StepContainer>
      </StepWrapper>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
