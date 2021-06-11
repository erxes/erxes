import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import DateControl from 'modules/common/components/form/DateControl';
import { Formgroup } from 'modules/common/components/form/styles';
import { __ } from 'modules/common/utils';
import {
  IField,
  IFieldAction,
  IFieldLogic
} from 'modules/settings/properties/types';
import SelectTags from 'modules/tags/containers/SelectTags';
import { ITag } from 'modules/tags/types';
import React from 'react';
import {
  dateTypeChoices,
  numberTypeChoices,
  stringTypeChoices
} from '../constants';
import { DateWrapper, LogicItem, LogicRow, RowFill, RowSmall } from '../styles';
// import BoardSelect from 'modules/boards/containers/BoardSelect';
// import CardSelect from 'modules/boards/components/portable/CardSelect';
import BoardItemSelectContainer from '../containers/BoardItemSelect';

type Props = {
  onChangeLogic: (
    name: string,
    value: string | number | Date,
    index: number,
    isLogic: boolean
  ) => void;
  logic?: IFieldLogic;
  action?: IFieldAction;
  fields: IField[];
  index: number;
  removeLogic: (index: number) => void;
  removeAction: (index: number) => void;
  fetchCards?: (stageId: string, callback: (cards: any) => void) => void;
  tags: ITag[];
  currentField: IField;
  type: string;
  onChangeProperty: (selectedField: IField) => void;
};

const logicOptions = [
  { value: 'show', label: 'Show this field' },
  { value: 'hide', label: 'Hide this field' }
];

const actionOptions = [
  { value: 'tag', label: 'Tag this contact' },
  { value: 'deal', label: 'Create a deal or select property' },
  { value: 'task', label: 'Create a task or select property' },
  { value: 'ticket', label: 'Create a ticket or select property' }
];

function FieldLogic(props: Props) {
  const {
    fields,
    logic,
    action,
    onChangeLogic,
    removeLogic,
    removeAction,
    index,
    type
  } = props;

  const isLogic = () => {
    if (type === 'logic') {
      return true;
    }

    return false;
  };

  const getSelectedField = () => {
    let fieldId = '';

    if (logic) {
      fieldId =
        type === 'logic' ? logic.fieldId || logic.tempFieldId || '' : '';
    }

    if (action) {
      fieldId =
        type === 'action' ? action.fieldId || action.tempFieldId || '' : '';
    }

    return fields.find(field => field._id === fieldId);
  };

  const getOperatorOptions = () => {
    let selectedField = getSelectedField();

    if (type === 'action') {
      selectedField = props.currentField;
    }

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
    onChangeLogic('fieldId', '', index, isLogic());

    if (props.type === 'action') {
      onChangeLogic('fieldId', 'self', index, isLogic());
    }

    onChangeLogic(
      value.startsWith('tempId') ? 'tempFieldId' : 'fieldId',
      value,
      index,
      isLogic()
    );

    const operators = getOperatorOptions();
    onChangeLogic('logicOperator', operators[1].value, index, isLogic());
  };

  const onChangeLogicOperator = e => {
    onChangeLogic('logicOperator', e.target.value, index, isLogic());
  };

  const onChangeLogicValue = e => {
    onChangeLogic('logicValue', e.target.value, index, isLogic());
  };

  const onDateChange = value => {
    onChangeLogic('logicValue', value, index, isLogic());
  };

  const remove = () => {
    if (type === 'logic') {
      return removeLogic(index);
    }

    removeAction(index);
  };

  const onChangeLogicAction = e => {
    onChangeLogic('boardId', '', index, isLogic());
    onChangeLogic('pipelineId', '', index, isLogic());
    onChangeLogic('stageId', '', index, isLogic());
    onChangeLogic('itemId', '', index, isLogic());
    onChangeLogic('itemName', '', index, isLogic());
    onChangeLogic('logicAction', e.currentTarget.value, index, isLogic());
  };

  const onChangeTags = values => {
    onChangeLogic('tagIds', values, index, isLogic());
  };

  const renderLogicValue = () => {
    let selectedField = getSelectedField();
    let logicValue = '';

    if (logic) {
      logicValue = logic.logicValue;
    }

    if (action) {
      selectedField = props.currentField;
      logicValue = action.logicValue;
    }

    if (selectedField) {
      if (
        selectedField.type === 'check' ||
        selectedField.type === 'select' ||
        selectedField.type === 'radio'
      ) {
        return (
          <FormControl
            componentClass="select"
            defaultValue={logicValue}
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
              value={logicValue}
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
            defaultValue={logicValue}
            name="logicValue"
            onChange={onChangeLogicValue}
            type={'number'}
          />
        );
      }

      return (
        <FormControl
          defaultValue={logicValue}
          name="logicValue"
          onChange={onChangeLogicValue}
        />
      );
    }

    return null;
  };

  const renderTags = () => {
    if (type === 'logic' || (action && action.logicAction !== 'tag')) {
      return null;
    }

    return (
      <FormGroup>
        <SelectTags
          type={'customer'}
          onChange={onChangeTags}
          defaultValue={(action && action.tagIds) || []}
        />
      </FormGroup>
    );
  };

  // const [selectedFieldId, setFieldId] = useState<string>(
  //   props.currentField.associatedFieldId || ''
  // );

  const renderBoardItemSelect = () => {
    if (
      type === 'logic' ||
      !action ||
      (action && action.logicAction === 'tag')
    ) {
      return null;
    }

    const onChangeCardSelect = (name, cardId) => {
      onChangeLogic('itemId', cardId, index, isLogic());
      onChangeLogic('itemName', name, index, isLogic());
    };

    const onChangeStage = stageId => {
      onChangeLogic('stageId', stageId, index, isLogic());
    };

    const onChangeProperty = (field?: IField) => {
      if (!field) {
        return;
      }
      props.onChangeProperty(field);
      onChangeLogic('logicAction', action.logicAction, index, isLogic());
    };

    let propertyId = props.currentField.associatedFieldId;

    if (action.itemId || action.itemName) {
      propertyId = '';
    }

    return (
      <BoardItemSelectContainer
        type={action.logicAction}
        boardId={action.boardId}
        pipelineId={action.pipelineId}
        stageId={action.stageId}
        onChangeCard={onChangeCardSelect}
        onChangeStage={onChangeStage}
        cardId={action.itemId}
        cardName={action.itemName}
        onChangeProperty={onChangeProperty}
        propertyId={propertyId}
      />
    );
  };

  const renderFields = () => {
    if (type === 'action' || !logic) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Fields</ControlLabel>
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
    );
  };

  let operatorValue = logic && logic.logicOperator;

  if (type === 'action' && action) {
    operatorValue = action.logicOperator;
  }

  let options = logicOptions;

  if (type === 'action') {
    options = actionOptions;
  }

  return (
    <LogicItem>
      <LogicRow>
        <RowFill>
          <FormGroup>
            <ControlLabel>Actions</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={action && action.logicAction}
              name="logicAction"
              options={options}
              onChange={onChangeLogicAction}
            />
          </FormGroup>

          {renderFields()}
          {renderTags()}
          {renderBoardItemSelect()}
          <LogicRow>
            <RowSmall>
              <ControlLabel>Operator</ControlLabel>
              <FormControl
                componentClass="select"
                defaultValue={operatorValue}
                name="logicOperator"
                options={getOperatorOptions()}
                onChange={onChangeLogicOperator}
              />
            </RowSmall>
            <Formgroup>
              <ControlLabel>Value</ControlLabel>
              <RowFill>{renderLogicValue()}</RowFill>
            </Formgroup>
          </LogicRow>
        </RowFill>
        <Button onClick={remove} btnStyle="danger" icon="times" />
      </LogicRow>
    </LogicItem>
  );
}

export default FieldLogic;
