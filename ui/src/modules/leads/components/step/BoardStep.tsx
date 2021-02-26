import BoardSelect from 'modules/boards/containers/BoardSelect';
import FormGroup from 'modules/common/components/form/Group';
import { LeftItem } from 'modules/common/components/step/styles';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import FieldChoices from 'modules/forms/components/FieldChoices';
import FieldForm from 'modules/forms/components/FieldForm';
import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';

import { FlexItem } from './style';

const defaultValue = {
  isSkip: false
};

type Props = {
  onDocChange?: (doc: IFormData) => void;
  fields: IField[];
  formData?: IFormData;
  type: string;
  skip?: boolean;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  mailSubject?: string;
  showSelect?: boolean;
};

type State = {
  fields: IField[];
  defaultValue: { [key: string]: boolean };
  isSkip?: boolean;
  currentMode: 'create' | 'update' | undefined;
  stageId: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
  cards: any;
  cardId: string;
  currentField?: IField;
};

class BoardStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fields: (props.formData ? props.formData.fields : props.fields) || [],
      defaultValue,
      disabled: false,
      currentMode: undefined,
      currentField: undefined,
      boardId: props.boardId || '',
      pipelineId: props.pipelineId || '',
      stageId: props.stageId || '',
      cardId: props.cardId || '',
      cards: []
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  renderSelect() {
    const { showSelect, type } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={type}
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  renderFields() {
    const { stageId } = this.state;
    if (!stageId) {
      return;
    }
    return (
      <>
        <Title>{__('Add a new field')}</Title>
        <p>{__('Choose a field type from the options below.')}</p>
        <FieldChoices onChoiceClick={this.onChoiceClick} />
      </>
    );
  }

  onChoiceClick = (choice: string) => {
    this.setState({
      currentMode: 'create',
      currentField: {
        _id: Math.random().toString(),
        contentType: 'form',
        type: choice
      }
    });
  };

  onFieldSubmit = (field: IField) => {
    const { onDocChange } = this.props;
    const { fields, currentMode } = this.state;

    let selector = { fields, currentField: undefined };

    if (currentMode === 'create') {
      selector = {
        fields: [...fields, field],
        currentField: undefined
      };
    }

    this.setState(selector, () => {
      if (onDocChange) {
        onDocChange(this.state);
      }
    });
  };

  onFieldDelete = (field: IField) => {
    // remove field from state
    const fields = this.state.fields.filter(f => f._id !== field._id);

    this.setState({ fields, currentField: undefined });
  };

  onFieldFormCancel = () => {
    this.setState({ currentField: undefined });
  };

  render() {
    const { type } = this.props;
    const { currentMode, currentField } = this.state;

    if (currentField) {
      return (
        <FieldForm
          type={type}
          mode={currentMode || 'create'}
          field={currentField}
          onSubmit={this.onFieldSubmit}
          onDelete={this.onFieldDelete}
          onCancel={this.onFieldFormCancel}
        />
      );
    }

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            {this.renderSelect()}
            {this.renderFields()}
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default BoardStep;
