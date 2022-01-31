import client from 'apolloClient';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import BoardSelect from 'modules/boards/containers/BoardSelect';
import Icon from 'modules/common/components/Icon';
import { Attributes } from '../styles';
import { IStage } from 'modules/boards/types';
import { queries as boardQueries } from 'modules/boards/graphql';
import gql from 'graphql-tag';
import { Alert, __ } from 'modules/common/utils';

type Props = {
  config: any;
  type: string;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName: string;
};

type State = {
  stageId: string;
  boardId: string;
  pipelineId: string;
  stages?: IStage[];
  stageName: IStage[];
};
export default class SelectBoard extends React.Component<Props, State> {
  private overlay: any;

  constructor(props) {
    super(props);

    const { config, inputName } = props;
    const { boardId, pipelineId } = config;

    this.state = {
      boardId: boardId || '',
      pipelineId: pipelineId || '',
      stageId: config[inputName] || '',
      stageName: config.stageName
    };
  }

  componentDidMount() {
    const { pipelineId, stages } = this.state;
    if (pipelineId && !stages) {
      client
        .query({
          query: gql(boardQueries.stages),
          variables: { pipelineId }
        })
        .then(data => {
          this.setState({ stages: data.data.stages });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  }

  hideContent = () => {
    this.overlay.hide();
  };

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onChange = stageId => {
    this.overlay.hide();

    const { config, setConfig, inputName } = this.props;
    const { stages = [] } = this.state;

    config[inputName] = `[[ ${stageId} ]]`;

    const stage = stages.find(s => s._id === stageId);

    config.boardId = this.state.boardId;
    config.pipelineId = this.state.pipelineId;
    config.stageName = stage ? stage.name : stageId;

    setConfig(config);
  };

  renderContent() {
    const { type } = this.props;

    const plIdOnChange = (plId, stages) =>
      this.setState({ pipelineId: plId, stages });
    const brIdOnChange = brId => this.setState({ boardId: brId });

    return (
      <Popover id="select-stage-popover">
        <Attributes>
          <React.Fragment>
            <BoardSelect
              type={type}
              stageId={this.state.stageId}
              boardId={this.state.boardId}
              pipelineId={this.state.pipelineId}
              onChangeStage={this.onChange}
              onChangePipeline={plIdOnChange}
              onChangeBoard={brIdOnChange}
              autoSelectStage={false}
            />
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlay => {
          this.overlay = overlay;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderContent()}
        rootClose={true}
        container={this}
      >
        <span>
          {__('Stages')} <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
