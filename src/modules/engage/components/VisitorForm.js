import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import MessengerForm from './step/MessengerForm';
import { StepWrapper, TitleContainer, StepContainer } from './step/Style';
import { FormControl } from 'modules/common/components';
import Step from './step/Step';
import VisitorStep1 from './step/VisitorStep1';
import { METHODS, MESSAGE_KINDS } from 'modules/engage/constants';

const propTypes = {
  message: PropTypes.object
};

class VisitorForm extends Step {
  constructor(props) {
    super(props);

    const message = props.message.messenger ? props.message.messenger : {};
    const rules = message.rules ? message.rules.map(rule => ({ ...rule })) : [];

    this.state = {
      step: 1,
      method: METHODS.MESSENGER,
      title: props.message.title || '',
      message: message.content || '',
      fromUser: props.message.fromUserId || '',
      rules,
      messenger: {
        brandId: message.brandId || '',
        sentAs: message.sentAs || ''
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

  render() {
    const breadcrumb = this.renderTitle();
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

VisitorForm.propTypes = propTypes;

export default VisitorForm;
