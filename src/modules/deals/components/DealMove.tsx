import { Icon, Tip } from 'modules/common/components';
import * as React from 'react';
import { DealSelect } from '../containers';
import {
  MoveContainer,
  MoveFormContainer,
  PipelineName,
  StageItem,
  Stages
} from '../styles/deal';
import { IDeal, IStage } from '../types';

type Props = {
  deal?: IDeal;
  stages: IStage[];
  stageId?: string;
  onChangeStage?: (stageId: string) => void;
};

type State = {
  boardId: string;
  pipelineId: string;
  show: boolean;
  stages: IStage[];
};

class DealMove extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);

    const {
      deal: { pipeline, boardId }
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

  onChangeField<T extends keyof State>(name: T, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  renderStages() {
    const { stageId, onChangeStage } = this.props;
    const { stages } = this.state;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => onChangeStage && onChangeStage(s._id)}>
                  <Icon icon="checked-1" />
                </a>
              </Tip>
            </StageItem>
          );

          if (s._id === stageId) isPass = false;

          return item;
        })}
      </Stages>
    );
  }

  renderDealSelect() {
    if (!this.state.show) return null;

    const { stageId, onChangeStage } = this.props;
    const { boardId, pipelineId } = this.state;

    return (
      <DealSelect
        stageId={stageId}
        boardId={boardId}
        pipelineId={pipelineId}
        callback={() => this.toggleForm()}
        onChangeStage={onChangeStage}
        onChangeStages={stages => this.onChangeField('stages', stages)}
        onChangePipeline={plId => this.onChangeField('pipelineId', plId)}
        onChangeBoard={brId => this.onChangeField('boardId', brId)}
      />
    );
  }

  render() {
    const deal = this.props.deal || ({} as IDeal);
    const { pipeline } = deal;

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={this.toggleForm}>
            {pipeline && pipeline.name} <Icon icon="downarrow" size={10} />
          </PipelineName>

          {this.renderDealSelect()}
        </MoveFormContainer>

        {this.renderStages()}
      </MoveContainer>
    );
  }
}

export default DealMove;
