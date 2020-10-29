import React from 'react';
import { IConditionFilter } from '../../types';
import Filter from './Filter';

type Props = {
  fields: any[];
  conditionKey: string;
  name: string;
  operator: string;
  value: string;
  onChange: (args: {
    key: string;
    name: string;
    operator: string;
    value: string;
  }) => void;
  onRemove: (id: string) => void;
};

class Condition extends React.Component<Props, {}> {
  removeCondition = () => {
    this.props.onRemove(this.props.conditionKey);
  };

  onChangeFilter = (filter: IConditionFilter) => {
    const { onChange, conditionKey } = this.props;

    return onChange({
      key: conditionKey,
      name: filter.name,
      operator: filter.operator,
      value: filter.value
    });
  };

  render() {
    const { fields, conditionKey, name, operator, value } = this.props;

    const cleanFields = fields.map(item => ({
      value: item.name || item._id,
      label: item.label || item.title,
      type: (item.type || '').toLowerCase(),
      selectOptions: item.selectOptions || []
    }));

    const filter = {
      key: conditionKey,
      name,
      operator,
      value
    };

    return (
      <Filter
        fields={cleanFields}
        filter={filter}
        groupData={true}
        onChange={this.onChangeFilter}
        onRemove={this.removeCondition}
      />
    );
  }
}

export default Condition;
