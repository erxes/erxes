import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React, { useState } from 'react';

type Props = {
  onFieldChange: (
    name: string,
    value: string | boolean | string[] | IFieldLogic[]
  ) => void;
  fields: IField[];
  currentField: IField;
};

const showOptions = [
  { value: 'show', label: 'Show this field' },
  { value: 'hide', label: 'Hide this field' }
];

function FieldLogic(props: Props) {
  const { fields, currentField, onFieldChange } = props;

  const [logics, setLogics] = useState(
    currentField.logics || [
      {
        fieldId: '',
        tempFieldId: '',
        logicOperator: 'c',
        logicValue: 'test'
      }
    ]
  );

  const onChangeLogicAction = e =>
    onFieldChange('logicAction', e.currentTarget.value);

  const onChangeOtherField = (name, value, index) => {
    // find current editing one
    const currentLogic = logics.find((l, i) => i === index);

    // set new value
    if (currentLogic) {
      currentLogic[name] = value;
    }

    setLogics(logics);
    onFieldChange('logics', logics);
  };

  const addLogic = () => {
    setLogics([
      ...logics,
      {
        fieldId: '',
        tempFieldId: '',
        logicOperator: 'c',
        logicValue: 'test'
      }
    ]);
  };

  const renderLogic = (logic: IFieldLogic, index: number) => {
    const onChangeFieldId = e => {
      onChangeOtherField('fieldId', e.target.value, index);
    };

    const remove = () => {
      setLogics(logics.filter((l, i) => i !== index));
      onFieldChange('logics', logics);
    };

    return (
      <FormGroup key={index}>
        <FormControl
          componentClass="select"
          value={logic.fieldId}
          name="fieldId"
          onChange={onChangeFieldId}
        >
          {fields
            .filter(field => field._id !== currentField._id)
            .map(field => (
              <option key={field._id} value={field._id}>
                {field.text}
              </option>
            ))}
        </FormControl>

        <Button size="small" onClick={remove} btnStyle="danger" icon="times" />
      </FormGroup>
    );
  };

  return (
    <>
      <FormGroup>
        <FormControl
          componentClass="select"
          defaultValue={currentField.logicAction}
          name="logicAction"
          options={showOptions}
          onChange={onChangeLogicAction}
        />
      </FormGroup>
      {logics.map((logic, index) => renderLogic(logic, index))}

      <Button size="small" onClick={addLogic} btnStyle="success" icon="times" />
    </>
  );
}

export default FieldLogic;
