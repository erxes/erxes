import BoardSelect from 'modules/boards/containers/BoardSelect';
import { SelectContainer } from 'modules/boards/styles/common';
import { HeaderRow } from 'modules/boards/styles/item';
import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';

import { IAction } from 'modules/automations/types';
import Common from '../Common';
import { BoardHeader } from 'modules/automations/styles';
import Attribution from '../Attribution';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (
    action: IAction,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => void;
  triggerType: string;
};

type State = {
  config: any;
};

class BoardItemForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config = {} } = this.props.activeAction;

    this.state = {
      config
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
    const config = this.state.config;

    return (
      <SelectContainer>
        <HeaderRow>
          <BoardHeader>
            <FormGroup>
              <div className="header-row">
                <ControlLabel required={true}>Name</ControlLabel>
                <Attribution
                  inputName="cardName"
                  config={this.state.config}
                  setConfig={config => this.setState({ config })}
                  triggerType={this.props.triggerType}
                />
              </div>
              <FormControl
                name="name"
                value={config.cardName}
                onChange={this.onChangeName}
              />
            </FormGroup>
          </BoardHeader>
        </HeaderRow>
      </SelectContainer>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderSelect()}
        {this.renderName()}
      </Common>
    );
  }
}

export default BoardItemForm;
