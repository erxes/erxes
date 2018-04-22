import React from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import { EmptyState, Button, Icon } from 'modules/common/components';
import { Stage } from '../containers';
import { Container, Header, Body } from '../styles/pipeline';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  stages: PropTypes.array,
  collectDeals: PropTypes.func,
  dealResult: PropTypes.object,
  addToDeals: PropTypes.func,
  expanded: PropTypes.bool
};

class Pipeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: props.expanded
    };

    this.togglePipeline = this.togglePipeline.bind(this);
  }

  renderStages(provided) {
    const { stages } = this.props;
    const length = stages.length;

    let content = (
      <div>
        {stages.map((stage, index) => (
          <Stage
            key={stage._id}
            stageId={stage._id}
            index={index}
            length={length}
            state={this.props[`stageState${stage._id}`]}
          />
        ))}
      </div>
    );

    if (stages.length === 0) {
      content = <EmptyState size="full" text="No stage" icon="layout" />;
    }

    return (
      <Body innerRef={provided.innerRef} {...provided.droppableProps}>
        {content}
      </Body>
    );
  }

  renderPipelineBody() {
    const { pipeline } = this.props;

    if (!this.state.expanded) {
      return null;
    }

    return (
      <Droppable
        type="pipeline"
        direction="horizontal"
        droppableId={pipeline._id}
      >
        {provided => this.renderStages(provided)}
      </Droppable>
    );
  }

  togglePipeline() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { pipeline } = this.props;
    const { expanded } = this.state;

    return (
      <Container>
        <Header>
          <h2>
            <Icon icon="verticalalignment" /> {pipeline.name}
          </h2>
          <div>
            <Button
              size="small"
              btnStyle="primary"
              onClick={this.togglePipeline}
              icon={expanded ? 'uparrow-2' : 'downarrow'}
            />
          </div>
        </Header>
        {this.renderPipelineBody()}
      </Container>
    );
  }
}

export default Pipeline;

Pipeline.propTypes = propTypes;
