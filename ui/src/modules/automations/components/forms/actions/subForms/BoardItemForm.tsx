import client from 'apolloClient';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { IAction } from 'modules/automations/types';
import { PRIORITIES } from 'modules/boards/constants';
import BoardSelect from 'modules/boards/containers/BoardSelect';
import { queries as pipelineQuery } from 'modules/boards/graphql';
import { IPipelineLabel } from 'modules/boards/types';
import { Alert } from 'modules/common/utils';
import React from 'react';
import Common from '../Common';
import PlaceHolderInput from '../placeHolder/PlaceHolderInput';
import { BoardItemWrapper } from '../styles';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
  pipelineLabels?: IPipelineLabel[];
  users: IUser[];
};

type State = {
  config: any;
  pipelineLabels: IPipelineLabel[];
};

class BoardItemForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { activeAction, pipelineLabels = [] } = this.props;
    let { config } = activeAction;
    if (!config) {
      config = {};
    }

    this.state = {
      config,
      pipelineLabels
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
    const plIdOnChange = plId => {
      client
        .query({
          query: gql(pipelineQuery.pipelineLabels),
          fetchPolicy: 'network-only',
          variables: { pipelineId: plId }
        })
        .then(data => {
          this.setState({ pipelineLabels: data.data.pipelineLabels });
        })
        .catch(e => {
          Alert.error(e.message);
        });
      this.onChangeField('pipelineId', plId);
    };
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

  onChange = rConf => {
    const { config } = this.state;

    this.setState({ config: { ...config, ...rConf } });
  };

  render() {
    const { triggerType, users } = this.props;
    const { config, pipelineLabels } = this.state;

    const userOptions = users.map(u => ({
      label: (u.details && u.details.fullName) || u.email,
      value: u._id
    }));

    const labelOptions = (pipelineLabels || []).map(l => ({
      label: l.name,
      value: l._id || ''
    }));

    const priorityOptions = PRIORITIES.map(p => ({ label: p, value: p }));

    return (
      <Common config={this.state.config} {...this.props}>
        <BoardItemWrapper>
          {this.renderSelect()}
          <PlaceHolderInput
            inputName="cardName"
            label="Name"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
          />
          <PlaceHolderInput
            inputName="description"
            label="Description"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
          />
          <PlaceHolderInput
            inputName="assignedTo"
            label="Assigned To"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
            fieldType="select"
            attrType="user"
            options={userOptions}
            isMulti={true}
          />
          <PlaceHolderInput
            inputName="closeDate"
            label="Close Date"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
            fieldType="date"
            attrType="Date"
            customAttributions={[
              {
                _id: String(Math.random()),
                label: 'Now',
                name: 'now',
                type: 'Date'
              }
            ]}
          />
          <PlaceHolderInput
            inputName="labelIds"
            label="Labels"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
            fieldType="select"
            excludeAttr={true}
            options={labelOptions}
            isMulti={true}
          />
          <PlaceHolderInput
            inputName="priority"
            label="Priority"
            config={config}
            onChange={this.onChange}
            triggerType={triggerType}
            fieldType="select"
            excludeAttr={true}
            options={priorityOptions}
          />
        </BoardItemWrapper>
      </Common>
    );
  }
}

export default BoardItemForm;
