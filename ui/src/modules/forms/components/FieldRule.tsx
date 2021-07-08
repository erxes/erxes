import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import DateControl from 'modules/common/components/form/DateControl';
import { __ } from 'modules/common/utils';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React from 'react';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from '../constants';
import { DateWrapper, LogicItem, LogicRow, RowFill } from '../styles';

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

const actionOptions = [
  { value: '', label: '' },
  { value: 'show', label: 'Show field' },
  { value: 'hide', label: 'Hide field' },
  { value: 'tag', label: 'Tag this contact' },
  { value: 'deal', label: 'Create a deal or select property' },
  { value: 'task', label: 'Create a task or select property' },
  { value: 'ticket', label: 'Create a ticket or select property' }
];

function FieldRule(props: Props) {
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

  const onChangeTargetFieldId = e => {
    const value = e.target.value;
    onChangeLogic('targetFieldId', '', index);
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

  const onChangeLogicAction = e => {
    // onChangeLogic('boardId', '', index, isLogic());
    // onChangeLogic('pipelineId', '', index, isLogic());
    // onChangeLogic('stageId', '', index, isLogic());
    // onChangeLogic('itemId', '', index, isLogic());
    // onChangeLogic('itemName', '', index, isLogic());
    onChangeLogic('logicAction', e.currentTarget.value, index);
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

  const renderActionRow = () => {
    // if (logic.logicAction === '') {
    //   return;
    // }

    return (
      <>
        <FormGroup>
          <ControlLabel>Field</ControlLabel>
          <FormControl
            componentClass="select"
            value={logic.targetFieldId || logic.tempFieldId}
            name="targetFieldId"
            onChange={onChangeTargetFieldId}
          >
            <option value="" />
            {fields.map(field => (
              <option key={field._id} value={field._id}>
                {field.text}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </>
    );
  };

  const renderConditionRow = () => {
    return (
      <LogicRow>
        <RowFill>
          <FormGroup>
            <ControlLabel>If</ControlLabel>
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
            <ControlLabel>State</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={logic.logicOperator}
              name="logicOperator"
              options={getOperatorOptions()}
              onChange={onChangeLogicOperator}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Value</ControlLabel>
            {renderLogicValue()}
          </FormGroup>
        </RowFill>
      </LogicRow>
    );
  };

  return (
    <LogicItem>
      <LogicRow>
        <RowFill>
          {renderConditionRow()}
          <FormGroup>
            <ControlLabel>Do</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={logic && logic.logicAction}
              name="logicAction"
              options={actionOptions}
              onChange={onChangeLogicAction}
            />
          </FormGroup>
          {renderActionRow()}
        </RowFill>

        <Button onClick={remove} btnStyle="danger" icon="times" />
      </LogicRow>
    </LogicItem>
  );
}

export default FieldRule;
