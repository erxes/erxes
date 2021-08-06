import React from 'react';
import { IConditionFilter } from '../../types';
import Filter from './Filter';
import FilterModal from './FilterModal';

type Props = {
  fields: any[];
  conditionKey: string;
  name: string;
  operator: string;
  value: string;
  segmentKey?: string;
  conjunction?: string;
  index?: number;
  onChange: (args: {
    segmentKey?: string;
    key: string;
    name: string;
    operator: string;
    value: string;
  }) => void;
  onRemove: (id: string, segmentKey?: string) => void;
  changeConjunction?: (segmentKey: string, conjunction: string) => void;
};

class Condition extends React.Component<Props, {}> {
  removeCondition = () => {
    this.props.onRemove(this.props.conditionKey, this.props.segmentKey);
  };

  onChangeFilter = (filter: IConditionFilter) => {
    const { onChange, conditionKey, segmentKey } = this.props;

    return onChange({
      segmentKey: segmentKey ? segmentKey : undefined,
      key: conditionKey,
      name: filter.name,
      operator: filter.operator,
      value: filter.value
    });
  };

  render() {
    const {
      fields,
      segmentKey,
      conditionKey,
      name,
      operator,
      value,
      index,
      conjunction
    } = this.props;

    const cleanFields = fields.map(item => ({
      value: item.name || item._id,
      label: item.label || item.title,
      type: (item.type || '').toLowerCase(),
      selectOptions: item.selectOptions || [],
      // radio button options
      choiceOptions: item.options || []
    }));

    const filter = {
      segmentKey: segmentKey || '',
      key: conditionKey,
      name,
      operator,
      value
    };

    if (segmentKey) {
      return (
        <FilterModal
          segmentKey={segmentKey}
          fields={cleanFields}
          filter={filter}
          index={index || 0}
          groupData={true}
          onChange={this.onChangeFilter}
          onRemove={this.removeCondition}
          conjunction={conjunction || 'and'}
          changeConjunction={this.props.changeConjunction}
        />
      );
    }

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
