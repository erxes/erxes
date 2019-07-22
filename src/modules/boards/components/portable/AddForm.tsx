import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
import React from 'react';
import BoardSelect from '../../containers/BoardSelect';
import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from '../../styles/item';
import { IItem, IItemParams, IOptions } from '../../types';
import { invalidateCache } from '../../utils';

type Props = {
  options: IOptions;
  customerIds?: string[];
  companyIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
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
};

class AddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      boardId: '',
      pipelineId: '',
      stageId: props.stageId || '',
      name: ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const { stageId, name } = this.state;
    const {
      companyIds,
      customerIds,
      saveItem,
      closeModal,
      callback
    } = this.props;

    if (!stageId) {
      return Alert.error('No stage');
    }

    if (!name) {
      return Alert.error('Enter name');
    }

    const doc = {
      name,
      stageId,
      customerIds: customerIds || [],
      companyIds: companyIds || []
    };

    // before save, disable save button
    this.setState({ disabled: true });

    saveItem(doc, (item: IItem) => {
      // after save, enable save button
      this.setState({ disabled: false });

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

  onChangeName = e =>
    this.onChangeField('name', (e.target as HTMLInputElement).value);

  render() {
    return (
      <AddContainer onSubmit={this.save}>
        {this.renderSelect()}

        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl autoFocus={true} onChange={this.onChangeName} />
          </HeaderContent>
        </HeaderRow>

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
      </AddContainer>
    );
  }
}

export default AddForm;
