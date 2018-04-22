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

    this.state = this.props.condition;
    this.handleInputValue = this.handleInputValue.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
    this.renderValueInput = this.renderValueInput.bind(this);

    // debounce text input
    this.changeCondition = debounce(this.props.changeCondition, 350);
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

  renderValueInput() {
    const { __ } = this.context;
    const { type, operator } = this.state;
    const currentOperator = operators[type].find(o => o.value === operator);

    if (!currentOperator || currentOperator.noInput) {
      return null;
    }

    const valueInput = (
      <FormControl
        name="value"
        type={type === 'number' ? 'number' : 'text'}
        value={this.state.value}
        onChange={this.handleValue}
      />
    );

    const dateUnitInput = (
      <FormControl
        name="dateUnit"
        componentClass="select"
        placeholder={__('select')}
        value={this.state.dateUnit}
        onChange={this.handleInputValue}
      >
        {Object.keys(dateUnits).map(key => (
          <option value={key} key={key}>
            {dateUnits[key]}
          </option>
        ))}
      </FormControl>
    );

    return (
      <span>
        {valueInput}
        {type === 'date' ? dateUnitInput : null}
        {type === 'date' && (operator === 'wlt' || operator === 'wmt')
          ? ' ago'
          : null}
      </span>
    );
  }

  render() {
    const { condition } = this.props;
    const { __ } = this.context;

    return (
      <ConditionItem>
        <ControlLabel ignoreTrans>{condition.field}</ControlLabel>
        <br />
        <FlexContent>
          <FlexItem>
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
            </FormControl>{' '}
            {this.renderValueInput()}
          </FlexItem>
          <FlexRightItem>
            <FormControl
              name="type"
              componentClass="select"
              placeholder={__('select')}
              value={this.state.type}
              onChange={this.handleInputValue}
            >
              {Object.keys(types).map(key => (
                <option value={key} key={key}>
                  {types[key]}
                </option>
              ))}
            </FormControl>
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
