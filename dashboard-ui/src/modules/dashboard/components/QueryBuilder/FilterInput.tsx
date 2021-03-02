import React from 'react';
// tslint:disable-next-line:ordered-imports
import { Select, Input } from 'antd';
import { complexFilters } from 'modules/dashboard/constants';

const FilterInputs = {
  string: ({ values, onChange, filters }) => {
    const selectOptions = [] as any;

    if (filters) {
      for (const filter of filters) {
        selectOptions.push(
          <Select.Option key={filter.label} value={filter.value}>
            {filter.label}
          </Select.Option>
        );
      }
    }

    return (
      <Select
        key="input"
        style={{
          width: 300
        }}
        mode="tags"
        onChange={onChange}
        value={values}
        optionFilterProp="key"
      >
        {selectOptions}
      </Select>
    );
  },

  number: ({ values, onChange }) => (
    <Input
      key="input"
      style={{
        width: 300
      }}
      onChange={e => onChange([e.target.value])}
      value={(values && values[0]) || ''}
    />
  )
};

type Props = {
  member?: any;
  updateMethods: any;
  type: any;
  filters: any[];
};

class FilterInput extends React.Component<Props> {
  onChangeFilter = values => {
    const { member, updateMethods } = this.props;

    const concatValues = Array.prototype.concat.apply([], values);

    updateMethods.update(member, { ...member, values: concatValues });
  };

  generateValues = () => {
    const { member, filters } = this.props;

    let customValues = [] as any;

    if (
      filters &&
      member.values &&
      complexFilters.includes(member.dimension.name)
    ) {
      for (const filter of filters) {
        for (const value of member.values) {
          const found = filter.value.find(element => element === value);

          if (found) {
            if (customValues.indexOf(filter.value) === -1) {
              customValues.push(filter.value);
            }
          }
        }
      }
    } else {
      customValues = member.values;
    }

    return customValues;
  };

  render() {
    const { member, filters } = this.props;

    const Filter = FilterInputs[member.dimension.type] || FilterInputs.string;

    return (
      <Filter
        filters={filters}
        key="filter"
        values={this.generateValues()}
        onChange={values => this.onChangeFilter(values)}
      />
    );
  }
}

export default FilterInput;
