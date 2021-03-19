import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React from 'react';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from '../constants';

type Props = {
  onChangeLogic: (name: string, value: string | number, index: number) => void;
  logic: IFieldLogic;
  fields: IField[];
  index: number;
  removeLogic: (index: number) => void;
};

function FieldLogic(props: Props) {
  const { fields, logic, onChangeLogic, removeLogic, index } = props;

  const getSelectedField = () => {
    return fields.find(
      field => field._id === logic.fieldId || field._id === logic.tempFieldId
    );
  };

  const getOperatorOptions = () => {
    const selectedField = getSelectedField();

    console.log('selected', selectedField);
    if (selectedField && selectedField.validation) {
      if (selectedField.validation === 'number') {
        return numberTypeChoices;
      }

      if (selectedField.validation.includes('date')) {
        return dateTypeChoices;
      }
    }

    return stringTypeChoices;
  };

  const onChangeFieldId = e => {
    const value = e.target.value;
    onChangeLogic('fieldId', '', index);
    onChangeLogic(
      value.startsWith('tempId') ? 'tempFieldId' : 'fieldId',
      value,
      index
    );
  };

  const onChangeLogicOperator = e => {
    onChangeLogic('logicOperator', e.target.value, index);
  };

  const onChangeLogicValue = e => {
    onChangeLogic('logicValue', e.target.value, index);
  };

  const remove = () => {
    removeLogic(index);
  };

  const renderLogicValue = () => {
    const selectedField = getSelectedField();

    if (selectedField) {
      if (
        selectedField.type === 'check' ||
        selectedField.type === 'select' ||
        selectedField.type === 'radio'
      ) {
        return (
          <FormControl
            componentClass="select"
            defaultValue={logic.logicValue}
            name="logicValue"
            onChange={onChangeLogicValue}
          >
            <option value="" />
            {selectedField.options &&
              selectedField.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </FormControl>
        );
      }

      return (
        <FormControl
          defaultValue={logic.logicValue}
          name="logicValue"
          onChange={onChangeLogicValue}
        />
      );
    }

    return null;
  };

  return (
    <>
      <FormGroup>
        <FormControl
          componentClass="select"
          value={logic.fieldId || logic.tempFieldId}
          name="fieldId"
          onChange={onChangeFieldId}
        >
          <option value="" />
          {fields.map(field => (
            <option key={field._id} value={field._id}>
              {field.text}
            </option>
          ))}
        </FormControl>
      </FormGroup>
      <FormGroup>
        <FormControl
          componentClass="select"
          defaultValue={logic.logicOperator}
          name="logicOperator"
          options={getOperatorOptions()}
          onChange={onChangeLogicOperator}
        />
      </FormGroup>

      <FormGroup>{renderLogicValue()}</FormGroup>
      <Button size="small" onClick={remove} btnStyle="danger" icon="times" />
    </>
  );
}

export default FieldLogic;
