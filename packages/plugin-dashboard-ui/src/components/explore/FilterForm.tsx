import { __ } from 'coreui/utils';
import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';

type Props = {
  updateFilters: any;
  availableDimensions: any[];
  filters: any;
  schemaType: string;
};

type State = {};

class FilterForm extends React.Component<Props, State> {
  render() {
    const {
      filters,
      availableDimensions,
      updateFilters,
      schemaType
    } = this.props;

    const onChangeFilterDimension = (filterIndex, m) => {
      const filter = filters[filterIndex];

      if (!m) {
        return updateFilters.remove(filter);
      }

      const value = JSON.parse(m.value);

      if (filter) {
        return updateFilters.update(filter, {
          ...filter,
          dimension: value
        });
      } else {
        return updateFilters.add({
          dimension: value
        });
      }
    };

    const onChangeOperator = (filterIndex, value) => {
      const filter = filters[filterIndex];

      updateFilters.update(filter, {
        ...filter,
        operator: value.value,
        values: []
      });
    };

    const renderFilterDimensionValue = index => {
      if (filters.length > 0) {
        const value = { ...filters[index] } as any;
        delete value.index;

        return JSON.stringify(value.dimension);
      }
    };

    const renderFilterOperatorValue = index => {
      const filter = filters[index];

      return filter.operator;
    };

    const renderFilterValue = index => {
      const filter = filters[index];

      return filter.values ? filter.values[0] : '';
    };

    const onChangeFilterValue = (filterIndex, e) => {
      const filter = filters[filterIndex];

      const value = e.target.value;

      updateFilters.update(filter, {
        ...filter,
        values: [value || '']
      });
    };

    const generateOptions = () => {
      const members = availableDimensions;

      const options = [] as any;

      members.map(member => {
        const name = member.name;

        if (name.startsWith(schemaType)) {
          options.push({
            label: member.title,
            value: JSON.stringify(member)
          });
        }
      });

      return options;
    };

    return (
      <FormGroup>
        <ControlLabel>Filter</ControlLabel>

        {filters.map(filter => {
          return (
            <>
              <FormGroup key={Math.random()}>
                <Select
                  options={generateOptions()}
                  value={renderFilterDimensionValue(filter.index)}
                  onChange={m => onChangeFilterDimension(filter.index, m)}
                  placeholder={__('Choose Dimension')}
                />
              </FormGroup>

              <FlexContent>
                <FlexItem count={3}>
                  <FormGroup>
                    <Select
                      options={filter.operators.map(operator => ({
                        label: operator.title,
                        value: operator.name
                      }))}
                      value={renderFilterOperatorValue(filter.index)}
                      onChange={m => onChangeOperator(filter.index, m)}
                      placeholder={__('Choose filter ')}
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem count={7} hasSpace={true}>
                  <FormGroup>
                    <FormControl
                      value={renderFilterValue(filter.index)}
                      onChange={m => onChangeFilterValue(filter.index, m)}
                      placeholder={__('Insert value')}
                    />
                  </FormGroup>
                </FlexItem>
              </FlexContent>
            </>
          );
        })}

        <Select
          options={generateOptions()}
          value={''}
          onChange={m => onChangeFilterDimension(100, m)}
          placeholder={__(`Choose Dimension`)}
        />
      </FormGroup>
    );
  }
}

export default FilterForm;
