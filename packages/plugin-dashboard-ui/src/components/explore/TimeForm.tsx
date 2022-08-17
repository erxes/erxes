import { __ } from 'coreui/utils';
import React from 'react';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

type Props = {
  update: any;
  availableDimensions: any[];
  dimensions: any;
};

type State = {
  vizState: any;
};

class DimensionForm extends React.Component<Props, State> {
  render() {
    const { dimensions, availableDimensions, updateDimensions } = this.props;

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

    if (dimensions.length === 0) {
      return (
        <FormGroup>
          <ControlLabel>Dimensions</ControlLabel>
          return (
          <Select
            options={availableDimensions.map(availableMeasure => ({
              label: availableMeasure.title,
              value: JSON.stringify(availableMeasure)
            }))}
            value={''}
            onChange={m => onChangeMeasure(100, m)}
            placeholder={__(`Choose Measure`)}
          />
          );
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>Time</ControlLabel>

        {dimensions.map(dimension => {
          return (
            <FormGroup key={Math.random()}>
              <Select
                options={availableDimensions.map(availableMeasure => ({
                  label: availableMeasure.title,
                  value: JSON.stringify(availableMeasure)
                }))}
                value={renderMeasureValue(dimension.index)}
                onChange={m => onChangeMeasure(dimension.index, m)}
                placeholder={__('Choose dimension')}
              />
            </FormGroup>
          );
        })}
      </FormGroup>
    );
  }
}

export default DimensionForm;
