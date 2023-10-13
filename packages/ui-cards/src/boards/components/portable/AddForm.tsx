import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IAttachment, IField } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';

import BoardSelect from '../../containers/BoardSelect';
import {
  BoardSelectWrapper,
  FormFooter,
  HeaderContent,
  HeaderRow
} from '../../styles/item';
import { IItem, IItemParams, IOptions, IStage } from '../../types';
import { invalidateCache } from '../../utils';
import CardSelect from './CardSelect';
import GenerateAddFormFields from './GenerateAddFormFields';
import * as _ from 'lodash';
import { checkLogic } from '@erxes/ui-forms/src/settings/properties/utils';
import { LogicParams } from '@erxes/ui-forms/src/settings/properties/types';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

type Props = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  mailSubject?: string;
  showSelect?: boolean;
  saveItem: (doc: IItemParams, callback: (item: IItem) => void) => void;
  fetchCards: (stageId: string, callback: (cards: any) => void) => void;
  closeModal: () => void;
  callback?: (item?: IItem) => void;
  fields: IField[];
  refetchFields: ({ pipelineId }: { pipelineId: string }) => void;
  stages?: IStage[];
  tagIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  showStageSelect?: boolean;
};

type State = {
  stageId: string;
  name: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
  cards: any;
  cardId: string;
  customFieldsData: any[];
  priority?: string;
  labelIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  assignedUserIds?: string[];
  attachments?: IAttachment[];
  description?: string;
  tagIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  relationData?: any;
};

class AddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      boardId: props.boardId || '',
      pipelineId: props.pipelineId || '',
      stageId: props.stageId || '',
      cardId: props.cardId || '',
      cards: [],
      name:
        localStorage.getItem(`${props.options.type}Name`) ||
        props.mailSubject ||
        '',
      customFieldsData: [],
      tagIds: props.tagIds || '',
      startDate: props.startDate || null,
      closeDate: props.closeDate || null
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    if (name === 'stageId') {
      const { fetchCards } = this.props;
      fetchCards(String(value), (cards: any) => {
        if (cards) {
          this.setState({
            cards: cards.map(c => ({ value: c._id, label: c.name }))
          });
        }
      });
    }

    if (name === 'pipelineId') {
      this.props.refetchFields({ pipelineId: value });
    }

    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const {
      stageId,
      name,
      cardId,
      priority,
      labelIds,
      startDate,
      closeDate,
      assignedUserIds,
      description,
      attachments,
      tagIds,
      relationData,
      departmentIds,
      branchIds
    } = this.state;

    let { customFieldsData } = this.state;

    const { saveItem, closeModal, callback } = this.props;
    let { fields } = this.props;

    if (!stageId) {
      return Alert.error('No stage');
    }

    if (!name && !cardId) {
      return Alert.error('Please enter name or select card');
    }

    fields = fields.filter(field => {
      const logics: LogicParams[] = (field.logics || []).map(logic => {
        let { fieldId = '' } = logic;

        if (fieldId.includes('customFieldsData')) {
          fieldId = fieldId.split('.')[1];
        }

        return {
          fieldId,
          operator: logic.logicOperator,
          logicValue: logic.logicValue,
          fieldValue: (customFieldsData.find(c => c.field === fieldId) || {})
            .value,
          validation: fields.find(f => f._id === fieldId)?.validation,
          type: field.type
        };
      });

      if (checkLogic(logics)) {
        return field;
      }
    });

    customFieldsData = customFieldsData.filter(customField =>
      fields.find(field => field._id === customField.field)
    );

    for (const field of fields) {
      const customField =
        customFieldsData.find(c => c.field === field._id) || {};

      if (field.isRequired) {
        let alert = false;

        if (field.isDefinedByErxes && !this.state[field.field || '']) {
          alert = true;
        } else if (!field.isDefinedByErxes && !customField.value) {
          alert = true;
        }

        // check if field is required but hidden
        if (!_.isEmpty(customField) && field._id !== customField.field) {
          alert = false;
        }

        if (alert) {
          return Alert.error('Please enter or choose a required field');
        }
      }
    }

    const doc: any = {
      name,
      stageId,
      customFieldsData,
      _id: cardId
    };

    if (priority) {
      doc.priority = priority;
    }

    if (labelIds && labelIds.length > 0) {
      doc.labelIds = labelIds;
    }

    if (startDate) {
      doc.startDate = startDate;
    }

    if (closeDate) {
      doc.closeDate = closeDate;
    }

    if (assignedUserIds && assignedUserIds.length > 0) {
      doc.assignedUserIds = assignedUserIds;
    }

    if (attachments) {
      doc.attachments = attachments;
    }

    if (description) {
      doc.description = description;
    }

    if (tagIds) {
      doc.tagIds = tagIds;
    }

    if (relationData) {
      doc.relationData = relationData;
    }

    if (branchIds) {
      doc.branchIds = branchIds;
    }

    if (departmentIds) {
      doc.departmentIds = departmentIds;
    }

    // before save, disable save button
    this.setState({ disabled: true });

    saveItem(doc, (item: IItem) => {
      // after save, enable save button
      this.setState({ disabled: false });

      localStorage.removeItem(`${this.props.options.type}Name`);

      closeModal();

      if (callback) {
        callback(item);
      }

      invalidateCache();
    });
  };

  renderSelect() {
    const { showSelect, options } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelectWrapper>
        <BoardSelect
          type={options.type}
          stageId={stageId}
          pipelineId={pipelineId}
          boardId={boardId}
          onChangeStage={stgIdOnChange}
          onChangePipeline={plIdOnChange}
          onChangeBoard={brIdOnChange}
        />
      </BoardSelectWrapper>
    );
  }

  onChangeCardSelect = option => {
    const { cardId, name } = option;

    if (cardId && cardId !== 'copiedItem') {
      this.onChangeField('name', '');

      return this.onChangeField('cardId', cardId);
    }

    this.onChangeField('cardId', '');
    this.onChangeField('name', name);

    localStorage.setItem(`${this.props.options.type}Name`, name);
  };

  onChangeName = e => {
    const name = (e.target as HTMLInputElement).value;
    this.onChangeField('name', name);

    localStorage.setItem(`${this.props.options.type}Name`, name);
  };

  onSelectStage = ({ value }) => {
    this.setState({ stageId: value });
  };

  onRelationsChange = (ids: string[], relationType: string) => {
    const { relationData = {} } = this.state;
    const key = relationType.split(':')[1];

    relationData[key] = ids;

    this.setState({ relationData });
  };

  render() {
    const { stages, showStageSelect } = this.props;

    let stageValues: any;

    if (stages && stages.length > 0) {
      stageValues = stages.map(stage => ({
        label: stage.name,
        value: stage._id
      }));
    }

    const { type } = this.props.options;

    return (
      <form onSubmit={this.save}>
        {this.renderSelect()}
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>

            {this.props.showSelect ? (
              <CardSelect
                placeholder={`Add a new ${type} or select one`}
                options={this.state.cards}
                onChange={this.onChangeCardSelect}
                type={type}
                additionalValue={this.state.name}
              />
            ) : (
              <FormControl
                value={this.state.name}
                autoFocus={true}
                placeholder="Create a new card"
                onChange={this.onChangeName}
              />
            )}
          </HeaderContent>
        </HeaderRow>

        {showStageSelect && (
          <HeaderRow>
            <HeaderContent>
              <ControlLabel required={true}>Stage</ControlLabel>
              <Select
                placeholder="Select a stage"
                value={this.state.stageId}
                options={stageValues}
                name="stage"
                onChange={e => this.onSelectStage(e)}
              />
            </HeaderContent>
          </HeaderRow>
        )}

        <GenerateAddFormFields
          object={this.state}
          pipelineId={this.state.pipelineId}
          onChangeField={this.onChangeField}
          customFieldsData={this.state.customFieldsData}
          fields={this.props.fields}
        />

        {loadDynamicComponent('relationForm', {
          ...this.props,
          onChange: this.onRelationsChange,
          contentType: `cards:${type}`
        })}

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="check-circle"
            type="submit"
          >
            Save
          </Button>
        </FormFooter>
      </form>
    );
  }
}

export default AddForm;
