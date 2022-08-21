import { __ } from 'coreui/utils';
import React from 'react';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

type Props = {
  updateDimensions: any;
  availableDimensions: any[];
  dimensions: any;
  schemaType: string;
};

type State = {};

class DimensionForm extends React.Component<Props, State> {
  render() {
    const {
      dimensions,
      availableDimensions,
      updateDimensions,
      schemaType
    } = this.props;

    const onChangeMeasure = (index, m) => {
      const dimension = dimensions[index];

      if (!m) {
        return updateDimensions.remove(dimension);
      }

      const value = JSON.parse(m.value);

      if (dimension) {
        return updateDimensions.update(dimension, value);
      }

      updateDimensions.add(value);
    };

    const renderMeasureValue = index => {
      if (dimensions.length > 0) {
        const value = { ...dimensions[index] } as any;
        delete value.index;

        return JSON.stringify(value);
      }
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
        <ControlLabel>Dimensions</ControlLabel>
        {dimensions.map(dimension => {
          return (
            <FormGroup key={Math.random()}>
              <Select
                options={generateOptions()}
                value={renderMeasureValue(dimension.index)}
                onChange={m => onChangeMeasure(dimension.index, m)}
                placeholder={__('Choose dimension')}
              />
            </FormGroup>
          );
        })}

        <Select
          options={generateOptions()}
          value={''}
          onChange={m => onChangeMeasure(100, m)}
          placeholder={__(`Choose Measure`)}
        />
      </FormGroup>
    );
  }
}

export default DimensionForm;
