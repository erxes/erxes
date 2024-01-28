import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import {
  Button,
  Chip,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __,
} from '@erxes/ui/src';
import { FlexRow } from '@erxes/ui/src/components/filterableList/styles';
import { Column, ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ConditionsContainer } from '../../styles';

const OPERATOR_TYPES = [
  { label: 'Is Equal to', value: 'isEqual' },
  { label: 'Is Not Equal to', value: 'notEqual' },
  { label: 'Is Contains', value: 'isContains' },
  { label: 'Is Not Contains', value: 'notContains' },
];

type Condtion = {
  _id: string;
  keywords: { _id: string; text: string }[];
  operator: string;
};

type Props = {
  _id: string;
  conditions: Condtion[];
  isNew?: boolean;
  onChange: (
    _id: string,
    name: string,
    value: Condtion[],
    isNew?: boolean,
  ) => void;
};

export default function DirectMessageForm({
  _id,
  conditions: propCondtions,
  onChange,
  isNew,
}: Props) {
  const [conditions, setConditions] = useState(propCondtions || []);

  const handleChangeCondtions = (conditions) => {
    onChange(_id, 'conditions', conditions, isNew);
    setConditions(conditions);
  };

  const addCondition = () =>
    handleChangeCondtions([
      ...conditions,
      { _id: Math.random().toString(), operator: '', keywords: [] },
    ]);

  const onChangeCondition = (_id: string, name: string, value: any) =>
    handleChangeCondtions(
      conditions.map((condition) =>
        condition._id === _id ? { ...condition, [name]: value } : condition,
      ),
    );

  const removeCondition = (_id: string) =>
    handleChangeCondtions(
      conditions.filter((condition) => condition._id !== _id),
    );

  const renderCondition = ({ _id, operator, keywords = [] }: Condtion) => {
    const handleKeyPress = (e, keywords) => {
      if (e.key === 'Enter') {
        onChangeCondition(_id, 'keywords', [
          ...keywords,
          { _id: Math.random().toString(), text: e.currentTarget.value },
        ]);

        e.currentTarget.value = '';
      }
    };

    const clearKeyword = (_id: string) => {
      onChangeCondition(
        _id,
        'keywords',
        keywords.filter((keyword) => keyword._id !== _id),
      );
    };

    return (
      <DrawerDetail key={_id}>
        <FormGroup>
          <ControlLabel>{__('Operator')}</ControlLabel>
          <Select
            value={operator}
            onChange={({ value }) => onChangeCondition(_id, 'operator', value)}
            options={OPERATOR_TYPES}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Keywords')}</ControlLabel>
          <FormControl onKeyPress={(e: any) => handleKeyPress(e, keywords)} />
        </FormGroup>
        {keywords.map(({ _id, text }) => (
          <Chip key={_id} onClick={() => clearKeyword(_id)}>
            {text}
          </Chip>
        ))}
        <Button
          btnStyle="link"
          icon="trash"
          block
          onClick={() => removeCondition(_id)}
        >
          {'Remove'}
        </Button>
      </DrawerDetail>
    );
  };

  return (
    <>
      <FlexRow>
        <ControlLabel>{__('Conditions')}</ControlLabel>
        <Button
          size="small"
          onClick={addCondition}
          icon="plus-1"
          btnStyle="simple"
        >
          {__('Add Conditions')}
        </Button>
      </FlexRow>
      <ConditionsContainer>
        {conditions.map((condition) => renderCondition(condition))}
      </ConditionsContainer>
    </>
  );
}
