import { Button, ControlLabel, FormControl } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { IDeal, IDealParams } from 'modules/deals/types';
import * as React from 'react';
import { DealSelect } from '../../containers';
import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from '../../styles/deal';

type Props = {
  customerId?: string;
  companyId?: string;

  // TODO: remove
  boardsQuery?: any;
  pipelinesQuery?: any;
  stagesQuery?: any;

  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  saveDeal: (doc: IDealParams, callback: () => void, deal?: IDeal) => void;
  showSelect?: boolean;
  closeModal: () => void;
};

type State = {
  stageId: string;
  name: string;
  disabled: boolean;
  boardId: string;
  pipelineId: string;
}

class DealAddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);

    this.state = {
      disabled: false,
      boardId: '',
      pipelineId: '',
      stageId: props.stageId || '',
      name: ''
    };
  }

  onChangeField<T extends keyof State>(name: T, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  save(e) {
    e.preventDefault();

    const { stageId, name } = this.state;
    const { customerId, companyId, saveDeal, closeModal } = this.props;

    if (!stageId) return Alert.error(__('No stage'));

    if (!name) return Alert.error(__('Enter name'));

    const doc = {
      name,
      stageId,
      customerIds: customerId ? [customerId] : [],
      companyIds: companyId ? [companyId] : []
    };

    // before save, disable save button
    this.setState({ disabled: true });

    saveDeal(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();
    });
  }

  renderSelect() {
    const { showSelect } = this.props;

    if (!showSelect) return null;

    const { stageId, pipelineId, boardId } = this.state;

    return (
      <DealSelect
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgId => this.onChangeField('stageId', stgId)}
        onChangePipeline={plId => this.onChangeField('pipelineId', plId)}
        onChangeBoard={brId => this.onChangeField('boardId', brId)}
      />
    );
  }

  render() {
    return (
      <AddContainer onSubmit={e => this.save(e)}>
        {this.renderSelect()}

        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              autoFocus
              onChange={(e: any) => this.onChangeField('name', e.target.value)}
            />
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

export default DealAddForm;
