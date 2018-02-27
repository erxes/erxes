import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../../containers';
import { Droppable } from 'react-beautiful-dnd';
import {
  PipelineContainer,
  PipelineHeader,
  PipelineBody,
  EmptyStage
} from '../../styles';
import { listObjectUnFreeze } from 'modules/common/utils';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  stages: PropTypes.array,
  collectStages: PropTypes.func,
  collectDeals: PropTypes.func,
  dealsByStage: PropTypes.object,
  stagesFromDb: PropTypes.array
};

class Pipeline extends React.Component {
  constructor(props) {
    super(props);

    this.addDealForm = this.addDealForm.bind(this);
    this.closeDealForm = this.closeDealForm.bind(this);

    this.state = {
      showDealForm: {}
    };

    props.collectStages(
      props.pipeline._id,
      listObjectUnFreeze(props.stagesFromDb)
    );
  }

  addDealForm(stageId) {
    const showDealForm = this.state.showDealForm;
    showDealForm[stageId] = true;

    this.setState({
      showDealForm
    });
  }

  closeDealForm(stageId) {
    const showDealForm = this.state.showDealForm;
    showDealForm[stageId] = false;

    this.setState({
      showDealForm
    });
  }

  render() {
    const { stages, pipeline, boardId, dealsByStage } = this.props;

    return (
      <PipelineContainer>
        <PipelineHeader>
          <h2>{pipeline.name}</h2>
        </PipelineHeader>
        <Droppable
          type="STAGE"
          direction="horizontal"
          droppableId={pipeline._id}
        >
          {provided => (
            <PipelineBody
              innerRef={provided.innerRef}
              {...provided.droppableProps}
            >
              <div>
                {stages.map((stage, index) => {
                  return (
                    <Stage
                      key={stage._id}
                      stage={stage}
                      index={index}
                      boardId={boardId}
                      pipelineId={pipeline._id}
                      showDealForm={this.state.showDealForm}
                      closeDealForm={this.closeDealForm}
                      addDealForm={this.addDealForm}
                      deals={dealsByStage[stage._id] || []}
                      collectDeals={this.props.collectDeals}
                    />
                  );
                })}
                <EmptyStage />
              </div>
            </PipelineBody>
          )}
        </Droppable>
      </PipelineContainer>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
