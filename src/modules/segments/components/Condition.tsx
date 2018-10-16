import debounce from 'lodash/debounce';
import { Button, ControlLabel, FormControl } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { dateUnits, operators, types } from 'modules/customers/constants';
import { FlexContent, FlexItem, FlexRightItem } from 'modules/layout/styles';
import * as React from 'react';
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
};

class Condition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.handleInputValue = this.handleInputValue.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.removeCondition = this.removeCondition.bind(this);

    this.state = this.props.condition;
  }

  handleInputValue<T extends keyof State>(name: T, value: State[T]) {
    const states = { [name]: value } as Pick<State, keyof State>;

    // Changing current operator when the type is changed
    if (name === 'type' && typeof value === 'string') {
      states.operator = operators[value][0].value || '';
    }

    this.setState(states, () => {
      const { changeCondition } = this.props;
      debounce(() => changeCondition(this.state), 350)();
    });
  }

  // changeCondition will be fired after 350ms
  handleValue(e) {
    e.preventDefault();

    const val = e.target.value;

    this.setState({ value: val }, () => {
      const { changeCondition } = this.props;

      // debounce text input
      debounce(() => changeCondition(this.state), 350)();
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
        componentClass="select"
        placeholder={__('select')}
        value={value}
        onChange={e =>
          this.handleInputValue(
            name,
            (e.currentTarget as HTMLInputElement).value
          )
        }
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
        componentClass="select"
        placeholder={__('select')}
        value={this.state.operator}
        onChange={e =>
          this.handleInputValue(
            'operator',
            (e.currentTarget as HTMLInputElement).value
          )
        }
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

    const field = fields.find(fieldItem => fieldItem._id === condition.field);

    return (
      <ConditionItem>
        <ControlLabel ignoreTrans={true}>
          {field ? field.title : ''}
        </ControlLabel>
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
