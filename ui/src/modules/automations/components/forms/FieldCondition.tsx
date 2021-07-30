import { __ } from 'erxes-ui';
import { ConditionContaier } from 'modules/automations/styles';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import DateControl from 'modules/common/components/form/DateControl';
import FormGroup from 'modules/common/components/form/Group';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from 'modules/forms/constants';
import {
  DateWrapper,
  LogicItem,
  LogicRow,
  RowFill,
  RowSmall
} from 'modules/forms/styles';
import { IField } from 'modules/settings/properties/types';

import React from 'react';
import { IFieldCondition } from './FieldConditions';

type Props = {
  fields: IField[];
  mainCondition: string;
  condition: IFieldCondition;
  onChangeCondition: (
    name: string,
    value: string | number | Date | boolean,
    index: number
  ) => void;
  index: number;
  isLast?: boolean;
  removeCondition: (index: number) => void;
};

const ConditionForm = (props: Props) => {
  const {
    fields,
    condition,
    onChangeCondition,
    removeCondition,
    index,
    mainCondition,
    isLast = false
  } = props;

  const getSelectedField = () => {
    return fields.find(field => field._id === condition.fieldId);
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
    // onChangeCondition('fieldId', '', index);
    onChangeCondition('fieldId', value, index);

    const selectedField = fields.find(f => f._id === value);

    onChangeCondition(
      'fieldText',
      (selectedField && selectedField.text) || '',
      index
    );

    const operators = getOperatorOptions();
    onChangeCondition('operator', operators[1].value, index);
  };

  const onChangeLogicOperator = e => {
    onChangeCondition('operator', e.target.value, index);
  };

  const onChangeLogicValue = e => {
    onChangeCondition('value', e.target.value, index);
  };

  const onDateChange = value => {
    onChangeCondition('value', value, index);
  };

  const remove = () => {
    removeCondition(index);
  };

  const renderConditionValue = () => {
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
            defaultValue={condition.value}
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
              value={condition.value}
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
            defaultValue={condition.value}
            name="logicValue"
            onChange={onChangeLogicValue}
            type={'number'}
          />
        );
      }

      return (
        <FormControl
          defaultValue={condition.value}
          name="logicValue"
          onChange={onChangeLogicValue}
        />
      );
    }

    return null;
  };

  const onClick = () => {
    onChangeCondition('saved', false, index);
  };

  const onSave = () => {
    onChangeCondition('saved', true, index);
  };

  const render = () => {
    return (
      <>
        <ConditionContaier onClick={onClick}>
          <h5 key={index}>{`IF ${condition.fieldText || ''} VALUE ${
            condition.operator
          } ${condition.value}`}</h5>
        </ConditionContaier>

        {!isLast ? <h5>{mainCondition || 'AND'}</h5> : null}
      </>
    );
  };

  const renderExtended = () => {
    return (
      <>
        <LogicItem>
          <LogicRow>
            <RowFill>
              <FormGroup>
                <FormControl
                  componentClass="select"
                  value={condition.fieldId}
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
                    defaultValue={condition.operator}
                    name="logicOperator"
                    options={getOperatorOptions()}
                    onChange={onChangeLogicOperator}
                  />
                </RowSmall>
                <RowFill>{renderConditionValue()}</RowFill>
              </LogicRow>
            </RowFill>
            <Button onClick={remove} btnStyle="danger" icon="times" />
          </LogicRow>
          <Button
            style={{ top: '10px', bottom: '10px' }}
            btnStyle="success"
            icon="checked-1"
            onClick={onSave}
          >
            Save
          </Button>
        </LogicItem>
        {!isLast ? <h5>{mainCondition || 'AND'}</h5> : null}
      </>
    );
  };

  return condition.saved ? render() : renderExtended();
};

export default ConditionForm;
