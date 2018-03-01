import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { StepWrapper, TitleContainer } from './step/style';
import { FormControl } from 'modules/common/components';
import {
  ChannelStep,
  SegmentStep,
  MessageStep,
  Steps,
  Step,
  ConditionStep
} from './step';
import _ from 'lodash';
import { Button } from 'modules/common/components';
import { Link } from 'react-router-dom';

const propTypes = {
  segments: PropTypes.array.isRequired,
  headSegments: PropTypes.array.isRequired,
  segmentFields: PropTypes.array.isRequired,
  segmentAdd: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  customerCounts: PropTypes.object.isRequired,
  count: PropTypes.func.isRequired,
  message: PropTypes.object,
  brands: PropTypes.array,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string
};

class AutoAndManualForm extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const rules = message.messenger
      ? message.messenger.rules.map(rule => ({ ...rule }))
      : [];
    let content = message.messenger ? message.messenger.content : '';
    content = message.email ? message.email.content : content;
    const messenger = message.messenger || {};
    const email = message.email || {};

    this.state = {
      activeStep: 1,
      maxStep: 3,
      validate: {
        step1: false,
        step2: true,
        step3: true
      },
      kind: message.kind || 'auto',
      method: message.method || 'messenger',
      title: message.title || '',
      segment: message.segmentId || '',
      message: content,
      fromUser: message.fromUserId,
      rules,
      messenger: {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || ''
      },
      email: {
        templateId: email.templateId || '',
        subject: email.subject || ''
      }
    };

    this.save = this.save.bind(this);
    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
    this.renderNextButton = this.renderNextButton.bind(this);
  }

  save(type, e) {
    const { save } = this.props;
    const doc = this.generateDoc(e);

    if (type === 'live') {
      save({ isLive: true, isDraft: false, ...doc });
    } else if (type === 'draft ') {
      save({ isLive: false, isDraft: true, ...doc });
    } else {
      save(doc);
    }
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      segmentId: this.state.segment,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      kind: this.state.kind,
      method: this.state.method
    };

    if (this.state.kind === 'manual') {
      doc.email = {
        templateId: this.state.email.templateId,
        subject: this.state.email.subject,
        content: this.state.message
      };
    } else if (this.state.kind === 'auto') {
      doc.messenger = {
        brandId: this.state.messenger.brandId,
        kind: this.state.messenger.kind,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    } else {
      doc.messenger = {
        rules: this.state.rules,
        brandId: this.state.messenger.brandId,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    }

    return doc;
  }

  componentDidMount() {
    this.checkValidate();
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  checkValidate() {
    let validate = Object.assign({}, this.state.validate);
    const {
      kind,
      segment,
      rules,
      fromUser,
      message,
      messenger,
      email
    } = this.state;
    if (kind === 'auto' || kind === 'manual') {
      if (segment === '') {
        validate['step2'] = true;
      } else {
        validate['step2'] = false;
      }
    } else if (kind === 'visitorAuto') {
      if (rules.length > 0) {
        validate['step2'] = false;
      } else {
        validate['step2'] = true;
      }
    }

    if (kind === 'auto') {
      if (
        messenger.brandId === '' ||
        messenger.kind === '' ||
        messenger.sentAs === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    } else if (kind === 'visitorAuto') {
      if (
        messenger.brandId === '' ||
        messenger.sentAs === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    } else if (kind === 'manual') {
      if (
        email.subject === '' ||
        email.templateId === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    }
    this.setState({ validate });
  }

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;
    this.checkValidate();
    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  }

  renderNextButton() {
    return (
      <Button
        btnStyle="primary"
        size="small"
        icon="ios-arrow-forward"
        onClick={() => this.next(0)}
      >
        Next
      </Button>
    );
  }

  renderSaveButton(message) {
    const cancelButton = (
      <Link to="/engage">
        <Button btnStyle="simple" size="small" icon="close">
          Cancel
        </Button>
      </Link>
    );

    if (!_.isEmpty(message)) {
      return (
        <Button.Group>
          {cancelButton}
          <Button
            btnStyle="primary"
            size="small"
            icon="ios-arrow-forward"
            onClick={e => this.save('save', e)}
          >
            Save
          </Button>
        </Button.Group>
      );
    }
    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="warning"
          size="small"
          icon="ios-arrow-forward"
          onClick={e => this.save('draft', e)}
        >
          Save & Draft
        </Button>
        <Button
          btnStyle="primary"
          size="small"
          icon="ios-arrow-forward"
          onClick={e => this.save('live', e)}
        >
          Save & Live
        </Button>
      </Button.Group>
    );
  }

  renderSegmentStep() {
    if (this.state.kind === 'visitorAuto') {
      return (
        <ConditionStep
          rules={this.state.rules}
          changeRules={this.changeState}
        />
      );
    }
    return (
      <SegmentStep
        changeSegment={this.changeState}
        segments={this.props.segments}
        headSegments={this.props.headSegments}
        segmentFields={this.props.segmentFields}
        segmentAdd={this.props.segmentAdd}
        counts={this.props.customerCounts}
        count={this.props.count}
        segment={this.state.segment}
      />
    );
  }

  render() {
    const {
      activeStep,
      validate,
      messenger,
      email,
      fromUser,
      message
    } = this.state;
    const defaultMessageStepValue = { messenger, email, fromUser, message };

    return (
      <StepWrapper>
        <Wrapper.Header
          breadcrumb={[
            { title: 'Engage', link: '/engage' },
            { title: 'New engagement' }
          ]}
        />
        <TitleContainer>
          <div>Title</div>
          <FormControl
            required
            onChange={e => this.changeState('title', e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <Steps active={activeStep}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Choose channel"
            nextButton={this.renderNextButton()}
            next={this.next}
            validate={validate['step1']}
          >
            <ChannelStep
              changeState={this.changeState}
              kind={this.state.kind}
            />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            nextButton={this.renderNextButton()}
            next={this.next}
            validate={validate['step2']}
          >
            {this.renderSegmentStep()}
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            nextButton={this.renderSaveButton(this.props.message)}
            next={this.next}
            validate={validate['step3']}
          >
            <MessageStep
              brands={this.props.brands}
              changeState={this.changeState}
              users={this.props.users}
              method={this.state.method}
              templates={this.props.templates}
              defaultValue={defaultMessageStepValue}
              kind={this.state.kind}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

AutoAndManualForm.propTypes = propTypes;

export default AutoAndManualForm;
