import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { IField, IFieldLogic } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { FieldsCombinedByType } from '../types';

import PropertyLogic from './PropertyLogic';

type Props = {
  onFieldChange: (
    name: string,
    value: string | boolean | string[] | IFieldLogic[]
  ) => void;
  fields: FieldsCombinedByType[];
  currentField: IField;
};

const showOptions = [
  { value: 'show', label: 'Show this field' },
  { value: 'hide', label: 'Hide this field' }
];

function FieldLogics(props: Props) {
  const { fields, currentField, onFieldChange } = props;

  const [logics, setLogics] = useState(
    (currentField.logics || []).map(
      ({ fieldId, tempFieldId, logicOperator, logicValue }) => {
        return {
          fieldId,
          tempFieldId,
          logicOperator,
          logicValue
        };
      }
    )
  );

  useEffect(() => {
    onFieldChange('logics', logics);
  }, [logics, onFieldChange]);

  const [isEnabled, toggleState] = useState(
    currentField.logics ? currentField.logics.length > 0 : false
  );

  const onChangeLogicAction = e =>
    onFieldChange('logicAction', e.currentTarget.value);

  const onChangeLogic = (name, value, index) => {
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
        logicOperator: 'is',
        logicValue: ''
      }
    ]);
  };

  const onEnableLogic = () => {
    toggleState(true);
    onFieldChange('logicAction', 'show');
    addLogic();
  };

  const removeLogic = (index: number) => {
    setLogics(logics.filter((l, i) => i !== index));
  };

  const renderContent = () => {
    if (isEnabled) {
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
          {logics.map((logic, index) => (
            <PropertyLogic
              key={index}
              fields={fields.filter(field => field.name !== currentField._id)}
              logic={logic}
              onChangeLogic={onChangeLogic}
              removeLogic={removeLogic}
              index={index}
            />
          ))}

          <LinkButton onClick={addLogic}>
            <Icon icon="plus-1" /> Add Logic Rule
          </LinkButton>
        </>
      );
    }

    return (
      <Button
        block={true}
        btnStyle="success"
        icon="check-circle"
        onClick={onEnableLogic}
      >
        Enable Logic
      </Button>
    );
  };

  return (
    <>
      <Info>
        {__(
          'Create rules to show or hide this element depending on the values of other fields'
        )}
      </Info>
      {renderContent()}
    </>
  );
}

export default FieldLogics;
