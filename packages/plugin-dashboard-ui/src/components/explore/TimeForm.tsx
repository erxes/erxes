import { __ } from 'coreui/utils';
import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';
import { DATE_RANGES } from '../../constants';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';

type Props = {
  timeDimensions: any;
  availableTimeDimensions: any;
  updateTimeDimensions: any;
  schemaType: string;
};

type State = {};

class TimeForm extends React.Component<Props, State> {
  render() {
    const {
      timeDimensions,
      availableTimeDimensions,
      updateTimeDimensions,
      schemaType
    } = this.props;

    const onChangeTimeDimensions = (index, m) => {
      const dimension = timeDimensions[index];

      if (!m) {
        return updateTimeDimensions.remove(dimension);
      }

      const value = JSON.parse(m.value);

      if (timeDimensions.length === 0) {
        return updateTimeDimensions.add({
          dimension: value,
          granularity: 'day',
          dateRange: 'This month'
        });
      }

      if (dimension) {
        return updateTimeDimensions.update(dimension, {
          ...dimension,
          dimension: value
        });
      }

      updateTimeDimensions.add({ dimension: value });
    };

    const onChangeDateRange = (index, value) => {
      const dimension = timeDimensions[index];

      if (dimension) {
        return updateTimeDimensions.update(dimension, {
          ...dimension,
          dateRange: value.value === 'All time' ? undefined : value.value
        });
      }
    };

    const renderDateRangeValue = value => {
      if (!value) {
        return 'All time';
      }

      return value;
    };

    const generateOptions = () => {
      const members = availableTimeDimensions;

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

    const renderTimeDimensionValue = index => {
      if (timeDimensions.length > 0) {
        if (timeDimensions[index]) {
          const value = { ...timeDimensions[index].dimension } as any;

          delete value.index;
          delete value.granularities;

          return JSON.stringify(value);
        }
      }
    };

    if (timeDimensions.length === 0) {
      return (
        <FormGroup key={Math.random()}>
          <ControlLabel>Time</ControlLabel>
          <Select
            options={generateOptions()}
            value={renderTimeDimensionValue(100)}
            onChange={value => onChangeTimeDimensions(100, value)}
            placeholder={__('Choose time dimension')}
          />
        </FormGroup>
      );
    }

    const renderGranularitiesOptions = timeDimension => {
      const dimension = timeDimension.dimension || {};

      const granularities = dimension.granularities || [];

      const updatedGranularities = [] as any;

      for (const granularitie of granularities) {
        if (!['Second', 'Minute'].includes(granularitie.title)) {
          updatedGranularities.push(granularitie);
        }
      }

      return updatedGranularities.map(granularitie => {
        return {
          label: granularitie.title,
          value: granularitie.name
        };
      });
    };

    const onChangeGranularites = (index, value) => {
      const dimension = timeDimensions[index];

      if (dimension) {
        if (value.value === 'hour') {
          return updateTimeDimensions.update(dimension, {
            ...dimension,
            dateRange: 'Today',
            granularity: value.value
          });
        }

        return updateTimeDimensions.update(dimension, {
          ...dimension,
          granularity: value.value === 'w/o grouping' ? undefined : value.value
        });
      }
    };

    const renderGranulariteValue = value => {
      if (!value) {
        return 'w/o grouping';
      }

      return value;
    };

    return (
      <FormGroup>
        <ControlLabel>Time</ControlLabel>

        {timeDimensions.map(timeDimension => {
          return (
            <>
              <FormGroup key={Math.random()}>
                <Select
                  options={generateOptions()}
                  value={renderTimeDimensionValue(timeDimension.index)}
                  onChange={value =>
                    onChangeTimeDimensions(timeDimension.index, value)
                  }
                  placeholder={__('Choose time dimension')}
                />
              </FormGroup>

              <FlexContent>
                <FlexItem count={5}>
                  <FormGroup>
                    <ControlLabel>For</ControlLabel>
                    <Select
                      options={DATE_RANGES.map(dateRange => ({
                        label: dateRange.title || dateRange.value,
                        value: dateRange.value
                      }))}
                      value={renderDateRangeValue(timeDimension.dateRange)}
                      onChange={value =>
                        onChangeDateRange(timeDimension.index, value)
                      }
                      placeholder={__('Choose date range')}
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem count={5} hasSpace={true}>
                  <FormGroup>
                    <ControlLabel>By</ControlLabel>
                    <Select
                      options={renderGranularitiesOptions(timeDimension)}
                      value={renderGranulariteValue(timeDimension.granularity)}
                      onChange={value =>
                        onChangeGranularites(timeDimension.index, value)
                      }
                      placeholder={__('Choose date range')}
                    />
                  </FormGroup>
                </FlexItem>
              </FlexContent>
            </>
          );
        })}
      </FormGroup>
    );
  }
}

export default TimeForm;
