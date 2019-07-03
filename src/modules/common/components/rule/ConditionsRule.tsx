import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexPad, InlineForm } from 'modules/common/components/step/styles';
import {
  RULE_CONDITIONS,
  VISITOR_AUDIENCE_RULES
} from 'modules/engage/constants';
import React from 'react';
import { IConditionsRule } from '../../types';

type Props = {
  rules: IConditionsRule[];
  onChange: (name: 'rules', rules: IConditionsRule[]) => void;
};

type State = {
  rules: IConditionsRule[];
};

class ConditionsRule extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      rules: this.props.rules || []
    };
  }

  addRule = e => {
    const rules = this.state.rules;
    const selectedOption = e.target.options[e.target.selectedIndex];

    if (selectedOption.value) {
      rules.push({
        _id: Math.random().toString(),
        kind: selectedOption.value,
        text: selectedOption.text,
        condition: '',
        value: ''
      });

      this.setState({ rules });
    }
  };

  renderRule(rule) {
    const remove = () => {
      let rules = this.state.rules;

      rules = rules.filter(r => r._id !== rule._id);

      this.setState({ rules });
      this.props.onChange('rules', rules);
    };

    const changeProp = (name, value) => {
      const rules = this.state.rules;

      // find current editing one
      const currentRule = rules.find(r => r._id === rule._id);

      // set new value
      if (currentRule) {
        currentRule[name] = value;
      }

      this.setState({ rules });
      this.props.onChange('rules', rules);
    };

    const onChangeValue = e => {
      changeProp('value', e.target.value);
    };

    const onChangeCondition = e => {
      changeProp('condition', e.target.value);
    };

    return (
      <FormGroup key={rule._id}>
        <ControlLabel>{rule.text}</ControlLabel>
        <InlineForm>
          <FormControl
            componentClass="select"
            defaultValue={rule.condition}
            onChange={onChangeCondition}
          >
            {RULE_CONDITIONS[rule.kind].map((cond, index) => (
              <option key={index} value={cond.value}>
                {cond.text}
              </option>
            ))}
          </FormControl>

          <FormControl
            type="text"
            value={rule.value}
            onChange={onChangeValue}
          />
          <Button
            size="small"
            onClick={remove}
            btnStyle="danger"
            icon="cancel-1"
          />
        </InlineForm>
      </FormGroup>
    );
  }

  render() {
    return (
      <FlexPad overflow="auto" direction="column">
        <FormGroup>
          <ControlLabel>Add rule</ControlLabel>
          <FormControl componentClass="select" onChange={this.addRule}>
            {VISITOR_AUDIENCE_RULES.map((rule, index) => (
              <option key={index} value={rule.value}>
                {rule.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          {this.state.rules.map(rule => this.renderRule(rule))}
        </FormGroup>
      </FlexPad>
    );
  }
}

export default ConditionsRule;
