import Button from "modules/common/components/Button";
import { FormControl } from "modules/common/components/form";
import { __ } from "modules/common/utils";
import { operators } from "modules/customers/constants";
import { FlexRightItem } from "modules/layout/styles";
import React from "react";
import Select from 'react-select-plus';
import { IConditionFilter, IField } from "../../types";
import { ConditionItem, FilterProperty, FilterRow } from "../styles";

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
      currentValue: filter.value,
    };
  }

  onChange = () => {
    const { currentName, currentOperator, currentValue } = this.state;
    const { onChange, filter } = this.props;

    return onChange({
      key: filter.key,
      name: currentName,
      operator: currentOperator,
      value: currentValue,
    });
  }

  onChangeValue = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ currentValue: (e.currentTarget as HTMLInputElement).value }, this.onChange);
  }

  onChangeNames = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ currentName: (e.currentTarget as HTMLInputElement).value }, this.onChange);
  }

  onChangeOperators = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ currentOperator: (e.currentTarget as HTMLInputElement).value }, this.onChange);
  }

  onChangeField = ({ value }: { value: string }) => {
    this.setState({ currentName: value }, this.onChange);
  }

  groupByType = () => {
    const { fields = [] } = this.props;
    
    return fields.reduce((acc, field) => {
      const value = field.value;
      const key = value.includes('.') ? value.substr(0, value.indexOf('.')) : 'general';

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(field);

      return acc;
    }, {});
  };

  generateValues = () => {
    const objects = this.groupByType();
    const array = [] as any;

    Object.keys(objects).map(key => {
      const obj = { label: key, options: objects[key] };
      return array.push(obj);
    });

    return array;
  }

  renderNames() {
    const { fields, groupData } = this.props;
    const { currentName } = this.state;

    return (
      <Select
        isRequired={true}
        options={groupData ? this.generateValues() : fields}
        clearable={false}
        value={currentName}
        onChange={this.onChangeField}
        placeholder={__("Select property")}
      />
    );
  }

  renderOperators() {
    const { currentOperator } = this.state;

    return (
      <FormControl componentClass="select" onChange={this.onChangeOperators} value={currentOperator}>
        <option value="">{__("Select operator")}...</option>
        {operators.map(c => (
          <option value={c.value} key={c.value}>
            {c.name}
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

    return <Button className="round" btnStyle="danger" uppercase={false} icon="times" onClick={this.onRemove} />;
  }

  renderValueInput = () => {
    const { currentValue, currentOperator } = this.state;

    if (['is', 'ins', 'it', 'if'].indexOf(currentOperator) >= 0) {
      return null;
    }

    return (
      <FormControl value={currentValue} onChange={this.onChangeValue} />
    );
  }

  render() {
    return (
      <ConditionItem>
        <FilterRow>
          <FilterProperty>
            {this.renderNames()}
          </FilterProperty>
          <FilterProperty>
            {this.renderOperators()}
          </FilterProperty>
          {this.renderValueInput()}
        </FilterRow>
        <FlexRightItem>
          {this.renderRemoveButton()}
        </FlexRightItem>
      </ConditionItem>
    );
  }
}

export default Filter;
