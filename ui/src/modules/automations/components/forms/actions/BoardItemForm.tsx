import BoardSelect from 'modules/boards/containers/BoardSelect';
import { SelectContainer } from 'modules/boards/styles/common';
import { HeaderRow, HeaderContent } from 'modules/boards/styles/item';
import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';

import { __ } from 'modules/common/utils';
import { IAction } from 'modules/automations/types';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (
    action: IAction,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => void;
};

type State = {
  config: any;
  cards: any;
};

class AddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config = {} } = this.props.activeAction;

    this.state = {
      config,
      cards: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeField = (name: string, value: string) => {
    const { config } = this.state;
    config[name] = value;

    this.setState({ config });
  };

  renderSelect() {
    const { activeAction } = this.props;

    let type = '';

    switch (activeAction.type) {
      case 'createDeal':
        type = 'deal';
        break;

      case 'createTask':
        type = 'task';
        break;

      case 'createTicket':
        type = 'ticket';
        break;
    }

    const { stageId, pipelineId, boardId } = this.state.config;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={type}
        stageId={stageId || ''}
        pipelineId={pipelineId || ''}
        boardId={boardId || ''}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  onChangeName = e => {
    const value = (e.target as HTMLInputElement).value;
    const { config } = this.state;
    config.cardName = value;

    this.setState({ config });
  };

  renderName() {
    const { config } = this.state;
    return (
      <SelectContainer>
        <HeaderRow>
          <HeaderContent>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                name="name"
                value={config.cardName}
                onChange={this.onChangeName}
              />
            </FormGroup>
          </HeaderContent>
        </HeaderRow>
      </SelectContainer>
    );
  }

  onSave = () => {
    const { addAction, activeAction, closeModal } = this.props;
    const { config } = this.state;

    addAction(activeAction, '', activeAction.id, config);
    closeModal();
  };

  render() {
    return (
      <>
        {this.renderSelect()}
        {this.renderName()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default AddForm;
