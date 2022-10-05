import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IAttachment, IField } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import BoardSelect from '../../containers/BoardSelect';
import {
  SelectInput,
  FormFooter,
  HeaderContent,
  HeaderRow,
  BoardSelectWrapper
} from '../../styles/item';
import { IItem, IItemParams, IOptions, IStage } from '../../types';
import { invalidateCache } from '../../utils';
import GenerateAddFormFields from './GenerateAddFormFields';

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
      customFieldsData,
      priority,
      labelIds,
      startDate,
      closeDate,
      assignedUserIds,
      description,
      attachments,
      tagIds
    } = this.state;
    const { saveItem, closeModal, callback, fields } = this.props;

    if (!stageId) {
      return Alert.error('No stage');
    }

    if (!name && !cardId) {
      return Alert.error('Please enter name or select card');
    }

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

  render() {
    const { stages, stageId } = this.props;

    let stageValues: any;

    if (stages && stages.length > 0) {
      stageValues = stages.map(stage => ({
        label: stage.name,
        value: stage._id
      }));
    }

    return (
      <form onSubmit={this.save}>
        {this.renderSelect()}
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <SelectInput>
              <FormControl
                value={this.state.name}
                autoFocus={true}
                placeholder="Create a new card"
                onChange={this.onChangeName}
              />
            </SelectInput>
          </HeaderContent>
        </HeaderRow>
        {!stageId && (
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
