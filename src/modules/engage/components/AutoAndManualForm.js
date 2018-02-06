import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { StepWrapper, TitleContainer, StepContainer } from './step/Style';
import { FormControl } from 'modules/common/components';
import Step from './step/Step';
import Step1 from './step/Step1';
import Step2 from './step/Step2';
import Step3 from './step/Step3';
import Step4 from './step/Step4';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  counts: PropTypes.object,
  segmentPush: PropTypes.func
};

class AutoAndManualForm extends Step {
  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      method: 'email',
      title: '',
      segment: '',
      message: '',
      fromUser: '',
      template: '',
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
    this.changeTemplate = this.changeTemplate.bind(this);
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

  changeTemplate(template) {
    this.setState({ template });
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

  render() {
    const breadcrumb = this.renderTitle();
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
            <img src="/images/icons/erxes-05.svg" alt="Channel" />,
            'Choose channel',
            true,
            <Step1
              changeMethod={this.changeMethod}
              method={this.state.method}
            />
          )}
          {this.renderStep(
            2,
            <img src="/images/icons/erxes-02.svg" alt="User" />,
            'Who is this message for?',
            true,
            <Step2
              changeSegment={this.changeSegment}
              segments={this.props.segments}
              counts={this.props.counts}
              segmentPush={this.props.segmentPush}
            />
          )}
          {this.renderStep(
            3,
            <img src="/images/icons/erxes-08.svg" alt="Email" />,
            'Compose your message',
            true,
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
              changeTemplate={this.changeTemplate}
            />
          )}
          {this.renderStep(
            4,
            <img src="/images/icons/erxes-13.svg" alt="Email" />,
            'You’re all set for lift off...',
            false,
            <Step4
              message={this.state.message}
              fromUser={this.state.fromUser}
              messenger={this.state.messenger}
              save={this.save}
              saveLive={this.saveLive}
              saveDraft={this.saveDraft}
              method={this.state.method}
              template={this.state.template}
            />
          )}
        </StepContainer>
      </StepWrapper>
    );
  }
}

AutoAndManualForm.propTypes = propTypes;

export default AutoAndManualForm;
