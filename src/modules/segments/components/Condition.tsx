import debounce from 'lodash/debounce';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { dateUnits, operators, types } from 'modules/customers/constants';
import { FlexContent, FlexItem, FlexRightItem } from 'modules/layout/styles';
import React from 'react';
import { ISegmentCondition } from '../types';
import { ConditionItem } from './styles';

type Props = {
  fields: any[];
  condition: ISegmentCondition;
  changeCondition: (condition: ISegmentCondition) => void;
  removeCondition: (id: string) => void;
};

type State = {
  _id: string;
  field: string;
  type: string;
  value: string;
  operator: string;
  dateUnit: string;
};

class Condition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = this.props.condition;
  }

  handleInputValue = <T extends keyof State>(name: T, value: State[T]) => {
    const states = { [name]: value } as Pick<State, keyof State>;

    this.setState(states, () => {
      const { changeCondition } = this.props;
      debounce(() => changeCondition(this.state), 350)();
    });
  };

  // changeCondition will be fired after 350ms
  handleValue = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    const target = e.currentTarget as HTMLInputElement;
    const val = target.value;

    this.setState({ value: val }, () => {
      const { changeCondition } = this.props;

      // debounce text input
      debounce(() => changeCondition(this.state), 350)();
    });
  };

  removeCondition = () => {
    this.props.removeCondition(this.props.condition._id);
  };

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

  renderSelect(name: keyof State, value: string, obj) {
    const onChange = (e: React.FormEvent<HTMLElement>) =>
      this.handleInputValue(name, (e.currentTarget as HTMLInputElement).value);

    return (
      <FormControl
        componentClass="select"
        placeholder={__('select')}
        value={value}
        onChange={onChange}
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
    const onChange = e =>
      this.handleInputValue(
        'operator',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <FormControl
        componentClass="select"
        placeholder={__('select')}
        value={this.state.operator}
        onChange={onChange}
      >
        <option />
        {operators[this.state.type].map(c => (
          <option value={c.value} key={c.value}>
            {c.name}
          </option>
        ))}
      </FormControl>
    );
  }

  renderFieldTitle() {
    const { fields, condition } = this.props;

    const field = fields.find(
      fieldItem =>
        fieldItem._id === condition.field &&
        fieldItem.brandId === condition.brandId
    );

    if (field) {
      if (field.brandName) {
        return `${field.brandName}: ${field.title}`;
      }

      return field.title;
    }

    return null;
  }

  render() {
    return (
      <ConditionItem>
        <ControlLabel ignoreTrans={true}>
          {this.renderFieldTitle()}
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
