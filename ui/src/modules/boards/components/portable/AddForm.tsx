import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
import React from 'react';
import BoardSelect from '../../containers/BoardSelect';
import { FormFooter, HeaderContent, HeaderRow } from '../../styles/item';
import { IItem, IItemParams, IOptions } from '../../types';
import { invalidateCache } from '../../utils';

type Props = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  cardId?: string;
  saveItem: (doc: IItemParams, callback: (item: IItem) => void) => void;
  showSelect?: boolean;
  closeModal: () => void;
  callback?: (item?: IItem) => void;
};

type State = {
  stageId: string;
  name: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
  cardId: string;
  customers?: string[];
  companies?: string[];
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
      name: ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const { stageId, name, cardId } = this.state;
    const { saveItem, closeModal, callback } = this.props;

    if (!stageId) {
      return Alert.error('No stage');
    }

    if (!name && !cardId) {
      return Alert.error('Please enter name or select card');
    }

    const doc = {
      name,
      stageId,
      _id: cardId
    };

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

    const { stageId, pipelineId, boardId, cardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);
    const cdIdOnChange = cdId => this.onChangeField('cardId', cdId);
    const cdNameOnChange = cdName => this.onChangeField('name', cdName);

    return (
      <BoardSelect
        type={options.type}
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        cardId={cardId}
        autoSelectCard={false}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
        onChangeCard={cdIdOnChange}
        onChangeCardName={cdNameOnChange}
      />
    );
  }

  onChangeName = e => {
    const name = (e.target as HTMLInputElement).value;

    this.onChangeField('name', name);

    localStorage.setItem(`${this.props.options.type}Name`, name);
  };

  render() {
    const { showSelect } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderSelect()}
        {!showSelect ? (
          <HeaderRow>
            <HeaderContent>
              <ControlLabel required={false}>Name</ControlLabel>
              <FormControl
                value={this.state.name}
                autoFocus={true}
                placeholder="Create a new card"
                onChange={this.onChangeName}
              />
            </HeaderContent>
          </HeaderRow>
        ) : (
          <div />
        )}

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
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
