import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { __ } from '@erxes/ui/src/utils';
import { IField, IFieldLogic } from '@erxes/ui/src/types';
import React from 'react';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from '../constants';
import { DateWrapper, LogicItem, LogicRow, RowSmall } from '../styles';
import { Column } from '@erxes/ui/src/styles/main';

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

    const operators = getOperatorOptions();
    onChangeLogic('logicOperator', operators[1].value, index);
  };

  const onChangeLogicOperator = e => {
    onChangeLogic('logicOperator', e.target.value, index);
  };

  const onChangeLogicValue = e => {
    onChangeLogic('logicValue', e.target.value, index);
  };

  const onDateChange = value => {
    onChangeLogic('logicValue', value, index);
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

      if (['date', 'datetime'].includes(selectedField.validation || '')) {
        return (
          <DateWrapper>
            <DateControl
              placeholder={__('pick a date')}
              value={logic.logicValue}
              timeFormat={
                selectedField.validation === 'datetime' ? true : false
              }
              onChange={onDateChange}
            />
          </DateWrapper>
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
        <Column>
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
            <Column>{renderLogicValue()}</Column>
          </LogicRow>
        </Column>
        <Button onClick={remove} btnStyle="danger" icon="times" />
      </LogicRow>
    </LogicItem>
  );
}

export default FieldLogic;
