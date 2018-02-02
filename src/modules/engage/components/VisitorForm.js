import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import MessengerForm from './step/MessengerForm';
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
import VisitorStep1 from './step/VisitorStep1';
import { METHODS, MESSAGE_KINDS } from 'modules/engage/constants';

const propTypes = {
  brands: PropTypes.array,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string,
  message: PropTypes.object
};

class Step extends Component {
  constructor(props) {
    super(props);

    const rules = props.message.messenger.rules
      ? props.message.messenger.rules.map(rule => ({ ...rule }))
      : [];

    this.state = {
      step: 1,
      method: METHODS.MESSENGER,
      title: props.message.title || '',
      message: props.message.messenger.content || '',
      fromUser: props.message.fromUserId || '',
      rules,
      messenger: {
        brandId: props.message.messenger.brandId || '',
        sentAs: props.message.messenger.sentAs || ''
      }
    };

    this.changeMessenger = this.changeMessenger.bind(this);
    this.changeMessage = this.changeMessage.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.changeRules = this.changeRules.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: METHODS.MESSENGER,
      messenger: {
        rules: this.state.rules,
        brandId: this.state.messenger.brandId,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      }
    };

    return doc;
  }

  changeRules(rules) {
    this.setState({ rules });
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

  changeMessage(message) {
    this.setState({ message });
  }

  showStep(step) {
    this.setState({ step });
  }

  save(e) {
    const doc = this.generateDoc(e);
    this.props.save(doc);
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
    const message = this.props.message._id;

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

    if (!hasNext && message) {
      next = (
        <Button
          size="small"
          btnStyle="success"
          onClick={e => this.save(e)}
          icon="checkmark"
        >
          Save
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
          <FormControl
            round
            onChange={e => this.changeTitle(e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <StepContainer>
          {this.renderStep(
            1,
            'Choose segment',
            true,
            <VisitorStep1
              rules={this.state.rules}
              changeRules={this.changeRules}
            />
          )}
          {this.renderStep(
            2,
            'Choose template',
            false,
            <MessengerForm
              brands={this.props.brands}
              changeMessenger={this.changeMessenger}
              changeMessage={this.changeMessage}
              message={this.state.message}
              changeUser={this.changeUser}
              users={this.props.users}
              hasKind={false}
              messenger={this.state.messenger}
              fromUser={this.state.fromUser}
            />
          )}
        </StepContainer>
      </StepWrapper>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
