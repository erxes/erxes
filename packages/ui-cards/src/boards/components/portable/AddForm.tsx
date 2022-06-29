import { SelectContainer } from '../../styles/common';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import BoardSelect from '../../containers/BoardSelect';
import {
  FormFooter,
  HeaderContent,
  HeaderRow,
  AddFormWidth
} from '../../styles/item';
import { IItem, IItemParams, IOptions } from '../../types';
import { invalidateCache } from '../../utils';
import CardSelect from './CardSelect';
import { IField } from '@erxes/ui/src/types';
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
      customFieldsData: []
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
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const { stageId, name, cardId, customFieldsData, priority } = this.state;
    const { saveItem, closeModal, callback } = this.props;

    if (!stageId) {
      return Alert.error('No stage');
    }

    if (!name && !cardId) {
      return Alert.error('Please enter name or select card');
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
      <BoardSelect
        type={options.type}
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
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

  render() {
    const { type } = this.props.options;

    return (
      <form onSubmit={this.save}>
        {this.renderSelect()}
        <SelectContainer>
          <HeaderRow>
            <HeaderContent>
              <ControlLabel required={true}>Name</ControlLabel>
              <AddFormWidth>
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
              </AddFormWidth>
            </HeaderContent>
          </HeaderRow>
          <GenerateAddFormFields
            onChangeField={this.onChangeField}
            customFieldsData={this.state.customFieldsData}
            fields={this.props.fields}
          />
        </SelectContainer>
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
