import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { types, operators, dateUnits } from 'modules/customers/constants';
import { Button, FormControl, ControlLabel } from 'modules/common/components';
import { FlexContent, FlexItem, FlexRightItem } from 'modules/layout/styles';
import { ConditionItem } from './styles';

const propTypes = {
  condition: PropTypes.object.isRequired,
  changeCondition: PropTypes.func.isRequired,
  removeCondition: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Condition extends Component {
  constructor(props) {
    super(props);

    this.handleInputValue = this.handleInputValue.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.removeCondition = this.removeCondition.bind(this);

    // debounce text input
    this.changeCondition = debounce(this.props.changeCondition, 350);

    this.state = this.props.condition;
  }

  handleInputValue(e) {
    e.preventDefault();

    const states = { [e.target.name]: e.target.value };

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
    const { __ } = this.context;

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
    const { __ } = this.context;

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
    const { condition } = this.props;

    return (
      <ConditionItem>
        <ControlLabel ignoreTrans>{condition.field}</ControlLabel>
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

Condition.propTypes = propTypes;
Condition.contextTypes = contextTypes;

export default Condition;
