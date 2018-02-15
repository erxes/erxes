import React from 'react';
import PropTypes from 'prop-types';
import { Stage } from '../';
import { Droppable } from 'react-beautiful-dnd';
import { PipelineContainer, PipelineHeader, PipelineBody } from '../../styles';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  stages: PropTypes.array,
  deals: PropTypes.array
};

class Pipeline extends React.Component {
  constructor(props) {
    super(props);

    this.addDealForm = this.addDealForm.bind(this);
    this.closeDealForm = this.closeDealForm.bind(this);

    this.state = {
      showDealForm: {}
    };
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
    const { stages, pipeline, boardId, deals } = this.props;

    const content = innerRef => (
      <PipelineBody innerRef={innerRef}>
        {stages.map((stage, index) => {
          return (
            <Stage
              key={stage._id}
              index={index}
              stage={stage}
              boardId={boardId}
              pipelineId={pipeline._id}
              deals={deals.filter(deal => deal.stageId === stage._id)}
              showDealForm={this.state.showDealForm}
              closeDealForm={this.closeDealForm}
              addDealForm={this.addDealForm}
            />
          );
        })}
      </PipelineBody>
    );

    return (
      <PipelineContainer>
        <PipelineHeader>
          <h2>{pipeline.name}</h2>
        </PipelineHeader>
        <Droppable type="STAGE" droppableId={pipeline._id}>
          {provided => content(provided.innerRef)}
        </Droppable>
      </PipelineContainer>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
