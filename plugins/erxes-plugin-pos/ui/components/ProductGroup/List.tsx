import { __, Info, Icon, FormGroup, FormControl, Button } from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { IProductGroup } from '../types';

type Props = {
  onFieldChange: (
    name: string,
    value: string | boolean | string[] | IProductGroup[]
  ) => void;
  groups: IProductGroup[];
  currentGroup: IProductGroup;
};

const showOptions = [
  { value: 'show', label: 'Show this field' },
  { value: 'hide', label: 'Hide this field' }
];

function FieldLogics(props: Props) {
  const { groups, currentGroup, onFieldChange } = props;

  const [categories, setCategories] = useState(currentGroup.categories || []);

  useEffect(() => {
    onFieldChange('categories', categories);
  }, [categories, onFieldChange]);

  const [isEnabled, toggleState] = useState(
    currentGroup.categories ? currentGroup.categories.length > 0 : false
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
            <FieldLogic
              key={index}
              fields={fields.filter(field => field._id !== currentField._id)}
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
