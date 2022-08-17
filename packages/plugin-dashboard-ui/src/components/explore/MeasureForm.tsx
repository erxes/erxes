import { __ } from 'coreui/utils';
import React from 'react';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

type Props = {
  updateMeasures: any;
  availableMeasures: any[];
  measures: any;
};

type State = {
  vizState: any;
};

class MeasureForm extends React.Component<Props, State> {
  render() {
    const { measures, availableMeasures, updateMeasures } = this.props;

    const onChangeMeasure = (index, m) => {
      const measure = measures[index];

      if (!m) {
        return updateMeasures.remove(measure);
      }

      const value = JSON.parse(m.value);

      if (measure) {
        return updateMeasures.update(measure, value);
      }

      updateMeasures.add(value);
    };

    const renderMeasureValue = index => {
      if (measures.length > 0) {
        const value = { ...measures[index] } as any;
        delete value.index;

        return JSON.stringify(value);
      }
    };

    if (measures.length === 0) {
    }

    return (
      <FormGroup>
        <ControlLabel>Measure</ControlLabel>

        {measures.map(measure => {
          return (
            <FormGroup key={Math.random()}>
              <Select
                options={availableMeasures.map(availableMeasure => ({
                  label: availableMeasure.title,
                  value: JSON.stringify(availableMeasure)
                }))}
                value={renderMeasureValue(measure.index)}
                onChange={m => onChangeMeasure(measure.index, m)}
                placeholder={__('Choose measure')}
              />
            </FormGroup>
          );
        })}

        <Select
          options={availableMeasures.map(availableMeasure => ({
            label: availableMeasure.title,
            value: JSON.stringify(availableMeasure)
          }))}
          value={''}
          onChange={m => onChangeMeasure(100, m)}
          placeholder={__(`Choose Measure`)}
        />
      </FormGroup>
    );
  }
}

export default MeasureForm;
