import debounce from 'lodash/debounce';
import { Button, ControlLabel, FormControl } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { dateUnits, operators, types } from 'modules/customers/constants';
import { FlexContent, FlexItem, FlexRightItem } from 'modules/layout/styles';
import React, { Component } from 'react';
import { ISegmentCondition } from '../types';
import { ConditionItem } from './styles';

type Props = {
  fields: any[];
  condition: ISegmentCondition;
  changeCondition: (condition: ISegmentCondition) => void;
  removeCondition: (field: string) => void;
};

type State = {
  field: string;
  type: string;
  value: string;
  operator: string;
  dateUnit: string;
}

class Condition extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handleInputValue = this.handleInputValue.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.removeCondition = this.removeCondition.bind(this);

    // debounce text input
    this.changeCondition = debounce(this.props.changeCondition, 350);

    this.state = this.props.condition;
  }

  changeCondition (condition: ISegmentCondition) {
  }

  handleInputValue(e) {
    e.preventDefault();

    const states = { [e.target.name]: e.target.value, operator: '' };

    // Changing current operator when the type is changed
    if (e.target.name === 'type') {
      states.operator = operators[e.target.value][0].value;
    }

    this.setState(states, () => {
      const { field, operator, value, dateUnit, type } = this.state;

      this.props.changeCondition({ field, operator, value, dateUnit, type });
    });
  }

  // changeCondition will be fired after 350ms
  handleValue(e) {
    e.preventDefault();

    const val = e.target.value;

    this.setState({ value: val }, () => {
      const { field, operator, value, dateUnit, type } = this.state;

      this.changeCondition({ field, operator, value, dateUnit, type });
    });
  }

  removeCondition() {
    this.props.removeCondition(this.props.condition.field);
  }

  renderInput() {
    const { type, value } = this.state;

    return (
      <FormControl
        name="value"
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={this.handleValue}
      />
    );
  }

  renderSelect(name, value, obj) {
    return (
      <FormControl
        name={name}
        componentClass="select"
        placeholder={__('select')}
        value={value}
        onChange={this.handleInputValue}
      >
        {Object.keys(obj).map(key => (
          <option value={key} key={key}>
            {obj[key]}
          </option>
        ))}
      </FormControl>
    );
  }

  renderCurrentOperator() {
    const { type, operator, dateUnit } = this.state;
    const currentOperator = operators[type].find(o => o.value === operator);

    if (!currentOperator || currentOperator.noInput) {
      return null;
    }

    const date =
      type === 'date'
        ? this.renderSelect('dateUnit', dateUnit, dateUnits)
        : null;
    const ago =
      type === 'date' && (operator === 'wlt' || operator === 'wmt')
        ? 'ago'
        : null;

    return (
      <span>
        {this.renderInput()}
        {date}
        {ago}
      </span>
    );
  }

  renderOperator() {
    return (
      <FormControl
        name="operator"
        componentClass="select"
        placeholder={__('select')}
        value={this.state.operator}
        onChange={this.handleInputValue}
      >
        {operators[this.state.type].map(c => (
          <option value={c.value} key={c.value}>
            {c.name}
          </option>
        ))}
      </FormControl>
    );
  }

  render() {
    const { fields, condition } = this.props;

    const field = fields.find(field => field._id === condition.field);

    return (
      <ConditionItem>
        <ControlLabel ignoreTrans>{field ? field.title : ''}</ControlLabel>
        <br />
        <FlexContent>
          <FlexItem>
            {this.renderOperator()}
            {this.renderCurrentOperator()}
          </FlexItem>
          <FlexRightItem>
            {this.renderSelect('type', this.state.type, types)}
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={this.removeCondition}
            />
          </FlexRightItem>
        </FlexContent>
      </ConditionItem>
    );
  }
}

export default Condition;
