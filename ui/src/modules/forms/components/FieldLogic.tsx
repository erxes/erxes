import Datetime from '@nateradebaugh/react-datetime';
import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React from 'react';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from '../constants';
import { LogicItem, LogicRow, RowFill, RowSmall } from '../styles';

type Props = {
  onChangeLogic: (
    name: string,
    value: string | number | Date,
    index: number
  ) => void;
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

  const onDateChange = (date?: Date | string) => {
    if (date) {
      onChangeLogic('logicValue', date, index);
    }
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

      if (selectedField.validation === 'date') {
        const dateValue = new Date(logic.logicValue);
        return (
          <Datetime
            dateFormat="YYYY/MM/DD"
            timeFormat={false}
            closeOnSelect={true}
            utc={true}
            input={false}
            value={dateValue}
            onChange={onDateChange}
          />
        );
      }

      if (selectedField.validation === 'datetime') {
        const dateValue = new Date(logic.logicValue);
        return (
          <Datetime
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            closeOnSelect={true}
            utc={true}
            input={false}
            value={dateValue}
            onChange={onDateChange}
          />
        );
      }

      if (selectedField.validation === 'number') {
        return (
          <FormControl
            defaultValue={logic.logicValue}
            name="logicValue"
            onChange={onChangeLogicValue}
            type={'number'}
          />
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
    <LogicItem>
      <LogicRow>
        <RowFill>
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
          <LogicRow>
            <RowSmall>
              <FormControl
                componentClass="select"
                defaultValue={logic.logicOperator}
                name="logicOperator"
                options={getOperatorOptions()}
                onChange={onChangeLogicOperator}
              />
            </RowSmall>
            <RowFill>{renderLogicValue()}</RowFill>
          </LogicRow>
        </RowFill>
        <Button onClick={remove} btnStyle="danger" icon="times" />
      </LogicRow>
    </LogicItem>
  );
}

export default FieldLogic;
