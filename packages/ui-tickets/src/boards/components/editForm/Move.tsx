import BoardSelect from '../../containers/BoardSelect';
import {
  MoveContainer,
  MoveFormContainer,
  MoveContainerWidth,
  PipelineName,
  PipelinePopoverContent,
  StageItem,
  Stages
} from '../../styles/item';
import { IStage } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { IItem, IOptions } from '../../types';

type Props = {
  item?: IItem;
  stages: IStage[];
  stageId?: string;
  onChangeStage?: (stageId: string) => void;
  options: IOptions;
};

type State = {
  boardId: string;
  pipelineId: string;
  show: boolean;
  stages: IStage[];
};

class Move extends React.Component<Props, State> {
  private ref;

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    const {
      item: { pipeline, boardId }
    } = props;

    this.state = {
      show: false,
      stages: props.stages || [],
      pipelineId: pipeline && pipeline._id,
      boardId
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.stages !== nextProps.stages) {
      this.setState({ stages: nextProps.stages });
    }
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ boardId });
  };

  onChangePipeline = (pipelineId: string, stages: IStage[]) => {
    this.setState({ pipelineId, stages });
  };

  toggleForm = () => {
    this.setState({ show: !this.state.show });
  };

  renderStages() {
    const { stageId, onChangeStage } = this.props;
    const { stages } = this.state;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const onClick = () => onChangeStage && onChangeStage(s._id);

          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name} placement="top">
                <span onClick={onClick}>
                  <Icon icon={isPass ? 'check-circle' : 'circle'} />
                </span>
              </Tip>
            </StageItem>
          );

          if (s._id === stageId) {
            isPass = false;
          }

          return item;
        })}
      </Stages>
    );
  }

  renderBoardSelect() {
    const { stageId, onChangeStage, options } = this.props;
    const { boardId, pipelineId } = this.state;

    return (
      <Popover id="pipeline-popover">
        <PipelinePopoverContent>
          <BoardSelect
            type={options.type}
            stageId={stageId}
            boardId={boardId}
            pipelineId={pipelineId}
            callback={this.toggleForm}
            onChangeStage={onChangeStage}
            onChangePipeline={this.onChangePipeline}
            onChangeBoard={this.onChangeBoard}
            autoSelectStage={false}
          />
        </PipelinePopoverContent>
      </Popover>
    );
  }

  renderMoveOut() {
    if (!this.props.options.isMove) {
      return null;
    }

    const item = this.props.item || ({} as IItem);
    const { pipeline } = item;

    return (
      <MoveFormContainer innerRef={this.ref}>
        <OverlayTrigger
          trigger="click"
          placement="bottom-start"
          overlay={this.renderBoardSelect()}
          rootClose={true}
          container={this.ref.current}
        >
          <PipelineName onClick={this.toggleForm}>
            {pipeline && pipeline.name} <Icon icon="angle-down" />
          </PipelineName>
        </OverlayTrigger>
      </MoveFormContainer>
    );
  }

  render() {
    return (
      <MoveContainer>
        <MoveContainerWidth>
          {this.renderMoveOut()}
          {this.renderStages()}
        </MoveContainerWidth>
      </MoveContainer>
    );
  }
}

export default Move;
