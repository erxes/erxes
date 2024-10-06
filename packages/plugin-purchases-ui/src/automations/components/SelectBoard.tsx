import { Alert, __ } from "coreui/utils";

import { Attributes } from "@erxes/ui-automations/src/components/forms/actions/styles";
import BoardSelect from "@erxes/ui-purchases/src/boards/containers/BoardSelect";
import { IStage } from "@erxes/ui-purchases/src/boards/types";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React from "react";
import { queries as boardQueries } from "@erxes/ui-purchases/src/boards/graphql";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";

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
      boardId: boardId || "",
      pipelineId: pipelineId || "",
      stageId: config[inputName] || "",
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
          this.setState({ stages: data.data.purchasesStages });
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
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
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

  render() {
    const { type } = this.props;

    const plIdOnChange = (plId, stages) =>
      this.setState({ pipelineId: plId, stages });
    const brIdOnChange = brId => this.setState({ boardId: brId });

    return (
      <Popover
        trigger={
          <span>
            {__("Stages")} <Icon icon="angle-down" />
          </span>
        }
        placement="top"
        innerRef={this.overlay}
      >
        <Attributes>
          <React.Fragment>
            {/* <BoardSelect
              type={type.includes("purchases:") ? type.slice(6) : type}
              stageId={this.state.stageId}
              boardId={this.state.boardId}
              pipelineId={this.state.pipelineId}
              onChangeStage={this.onChange}
              onChangePipeline={plIdOnChange}
              onChangeBoard={brIdOnChange}
              autoSelectStage={false}
            /> */}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }
}
