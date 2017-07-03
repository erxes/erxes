import React, { PropTypes } from 'react';
import { FormControl, Button, ControlLabel, FormGroup } from 'react-bootstrap';

import { METHODS, MESSAGE_KINDS } from '/imports/api/engage/constants';
import { Wrapper } from '/imports/react-ui/layout/components';

import { VISITOR_AUDIENCE_RULES, RULE_CONDITIONS } from '/imports/api/engage/constants';

import FormBase from './FormBase';
import MessengerForm from './MessengerForm';

const propTypes = {
  brands: PropTypes.array,
};

class VisitorForm extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const messenger = message.messenger ? message.messenger : {};
    const rules = messenger.rules ? messenger.rules : [];

    this.state = { messengerContent: '', rules };

    // binds
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
    this.addRule = this.addRule.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      method: METHODS.MESSENGER,
      messenger: {
        rules: this.state.rules,
        brandId: document.getElementById('brandId').value,
        sentAs: document.getElementById('messengerSentAs').value,
        content: this.state.messengerContent,
      },
    };

    return doc;
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  addRule(e) {
    const rules = this.state.rules;

    const selectedOption = e.target.options[e.target.selectedIndex];

    if (selectedOption.value) {
      rules.push({
        _id: Math.random().toString(),
        kind: selectedOption.value,
        text: selectedOption.text,
        condition: '',
        value: '',
      });

      this.setState({ rules });
    }
  }

  renderRule(rule) {
    const remove = () => {
      let rules = this.state.rules;

      rules = rules.filter(r => r._id !== rule._id);

      this.setState({ rules });
    };

    const changeProp = (name, value) => {
      const rules = this.state.rules;

      // find current editing one
      const currentRule = rules.find(r => r._id === rule._id);

      // set new value
      currentRule[name] = value;

      this.setState({ rules });
    };

    const onChangeValue = e => {
      changeProp('value', e.target.value);
    };

    const onChangeCondition = e => {
      changeProp('condition', e.target.value);
    };

    return (
      <FormGroup key={rule._id}>
        <ControlLabel>
          {rule.text}:
        </ControlLabel>
        <div className="flex-form">
          <FormControl
            className="flex-item"
            componentClass="select"
            defaultValue={rule.condition}
            onChange={onChangeCondition}
          >
            {RULE_CONDITIONS[rule.kind].map((cond, index) =>
              <option key={index} value={cond.value}>
                {cond.text}
              </option>,
            )}
          </FormControl>

          <FormControl
            className="flex-item"
            type="text"
            value={rule.value}
            onChange={onChangeValue}
          />

          <Button className="flex-item" bsSize="small" onClick={remove} bsStyle="danger">
            <i className="ion-close-round" />
          </Button>
        </div>
      </FormGroup>
    );
  }

  renderSidebarExtra() {
    const { Section } = Wrapper.Sidebar;
    const { Title } = Wrapper.Sidebar.Section;

    return (
      <Section>
        <Title>Add rule</Title>
        <div className="box">
          <FormControl componentClass="select" onChange={this.addRule}>
            {VISITOR_AUDIENCE_RULES.map((rule, index) =>
              <option key={index} value={rule.value}>
                {rule.text}
              </option>,
            )}
          </FormControl>
        </div>

        <div className="box">
          {this.state.rules.map(rule => this.renderRule(rule))}
        </div>
      </Section>
    );
  }

  renderContent() {
    const message = this.getMessage();

    return (
      <MessengerForm
        message={message}
        onContentChange={this.onMessengerContentChange}
        brands={this.props.brands}
      />
    );
  }
}

VisitorForm.propTypes = propTypes;

export default VisitorForm;
