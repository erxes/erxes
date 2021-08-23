import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { FlexRightItem } from 'modules/layout/styles';
import React from 'react';
import Select from 'react-select-plus';
import { IConditionFilter, IField } from '../../types';
import { ConditionItem, FilterProperty, FilterRow } from '../styles';

const operators = {
  string: [
    { name: 'equals', value: 'e' },
    { name: 'is not equal to', value: 'dne' },
    { name: 'contains', value: 'c' },
    { name: 'does not contain', value: 'dnc' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  boolean: [
    { name: 'is true', value: 'it', noInput: true },
    { name: 'is false', value: 'if', noInput: true },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  number: [
    { name: 'number: equals', value: 'numbere' },
    { name: 'number: is not equal to', value: 'numberdne' },
    { name: 'number: is greater than', value: 'numberigt' },
    { name: 'number: is less than', value: 'numberilt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  date: [
    { name: 'date: is greater than', value: 'dateigt' },
    { name: 'date: is less than', value: 'dateilt' },
    { name: '* minute(s) before', value: 'wobm' },
    { name: '* minute(s) later', value: 'woam' },
    { name: '* day(s) before', value: 'wobd' },
    { name: '* day(s) later', value: 'woad' },
    { name: 'date relative less than', value: 'drlt' },
    { name: 'date relative greater than', value: 'drgt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ]
};

const defaultOperators = [
  ...operators.string,
  ...operators.boolean,
  ...operators.number,
  ...operators.date
];

type Props = {
  fields: IField[];
  filter: IConditionFilter;
  onChange: (filter: IConditionFilter) => void;
  onRemove?: (id: string) => void;
  groupData?: boolean;
};

type State = {
  key: string;
  currentName: string;
  currentOperator: string;
  currentValue: string;
};

class Filter extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { filter } = this.props;

    this.state = {
      key: filter.key || '',
      currentName: filter.name,
      currentOperator: filter.operator,
      currentValue: filter.value
    };
  }

  onChange = () => {
    const { currentName, currentOperator, currentValue } = this.state;
    const { onChange, filter } = this.props;

    return onChange({
      key: filter.key,
      name: currentName,
      operator: currentOperator,
      value: currentValue
    });
  };

  onChangeValue = (e: React.FormEvent<HTMLElement>) => {
    this.setState(
      { currentValue: (e.currentTarget as HTMLInputElement).value },
      this.onChange
    );
  };

  onChangeNames = (e: React.FormEvent<HTMLElement>) => {
    this.setState(
      { currentName: (e.currentTarget as HTMLInputElement).value },
      this.onChange
    );
  };

  onChangeOperators = (e: React.FormEvent<HTMLElement>) => {
    this.setState(
      { currentOperator: (e.currentTarget as HTMLInputElement).value },
      this.onChange
    );
  };

  onChangeSelect = (option: { value: string }) => {
    const value = !option ? '' : option.value.toString();

    this.setState({ currentValue: value }, this.onChange);
  };

  onChangeField = (option: { value: string }) => {
    const value = !option ? '' : option.value;

    this.setState({ currentName: value }, this.onChange);
  };

  groupByType = () => {
    const { fields = [] } = this.props;

    return fields.reduce((acc, field) => {
      const value = field.value;
      const key =
        value && value.includes('.')
          ? value.substr(0, value.indexOf('.'))
          : 'general';

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(field);

      return acc;
    }, {});
  };

  getSelectedField(currentName: string) {
    const { fields } = this.props;

    const field =
      fields.find(item => item.value === currentName) || ({} as IField);

    return field;
  }

  generateValues = () => {
    const objects = this.groupByType();
    const array = [] as any;

    Object.keys(objects).map(key => {
      const obj = { label: key, options: objects[key] };
      return array.push(obj);
    });

    return array;
  };

  renderNames() {
    const { fields, groupData } = this.props;
    const { currentName } = this.state;

    return (
      <Select
        key="propertyName"
        isRequired={true}
        options={groupData ? this.generateValues() : fields}
        clearable={false}
        value={currentName}
        onChange={this.onChangeField}
        placeholder={__('Select property')}
        id="New-segment-select-property"
      />
    );
  }

  renderOperators() {
    const { currentName, currentOperator } = this.state;

    const field = this.getSelectedField(currentName);

    const type = field.type || '';
    const fieldOperator = operators[type] || defaultOperators;

    return (
      <FormControl
        id="segment-select-operator"
        key={currentName}
        componentClass="select"
        onChange={this.onChangeOperators}
        value={currentOperator}
      >
        <option value="">{__('Select operator')}...</option>
        {fieldOperator.map((operator, index) => (
          <option value={operator.value} key={`${index}-${operator.value}`}>
            {operator.name}
          </option>
        ))}
      </FormControl>
    );
  }

  onRemove = () => {
    const { onRemove } = this.props;

    if (onRemove) {
      onRemove(this.props.filter.key || '');
    }
  };

  renderRemoveButton = () => {
    const { onRemove } = this.props;

    if (!onRemove) {
      return;
    }

    return (
      <Button
        className="round"
        btnStyle="danger"
        icon="times"
        onClick={this.onRemove}
      />
    );
  };

  renderSelect(
    value: string | number,
    options: Array<{ label: string; value: string | number }>
  ) {
    return (
      <Select
        placeholder={__('Select value')}
        value={value}
        options={options}
        isRequired={true}
        clearable={false}
        onChange={this.onChangeSelect}
      />
    );
  }

  renderPropertyComponent = () => {
    const { currentName, currentValue, currentOperator } = this.state;

    if (['is', 'ins', 'it', 'if'].indexOf(currentOperator) >= 0) {
      return null;
    }

    const field = this.getSelectedField(currentName);

    const { selectOptions = [], choiceOptions = [], type } = field;

    if (selectOptions.length > 0) {
      return this.renderSelect(currentValue, selectOptions);
    }

    // if custom field is of type radio, then show options as select
    if (type === 'radio' && choiceOptions.length > 0) {
      const options = choiceOptions.map(opt => ({ value: opt, label: opt }));

      return this.renderSelect(currentValue, options);
    }

    return <FormControl value={currentValue} onChange={this.onChangeValue} />;
  };

  render() {
    return (
      <ConditionItem>
        <FilterRow>
          <FilterProperty>{this.renderNames()}</FilterProperty>
          <FilterProperty>{this.renderOperators()}</FilterProperty>
          <FilterProperty>{this.renderPropertyComponent()}</FilterProperty>
        </FilterRow>
        <FlexRightItem>{this.renderRemoveButton()}</FlexRightItem>
      </ConditionItem>
    );
  }
}

export default Filter;
