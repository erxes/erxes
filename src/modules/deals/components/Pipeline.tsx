import { Button, EmptyState, Icon } from 'modules/common/components';
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Stage } from '../containers';
import { Body, Container, Header } from '../styles/pipeline';

type Props = {
  pipeline: any,
  onToggle: any,
  stages: any,
  isExpanded: boolean
};

class Pipeline extends React.Component<Props, { isExpanded: boolean }> {
  constructor(props) {
    super(props);

    this.state = { isExpanded: props.isExpanded };

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

    if (!this.state.isExpanded) {
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
    const { isExpanded } = this.state;

    this.setState({ isExpanded: !isExpanded });

    this.props.onToggle(!isExpanded);
  }

  render() {
    const { pipeline } = this.props;
    const { isExpanded } = this.state;

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
              icon={isExpanded ? 'uparrow-2' : 'downarrow'}
            />
          </div>
        </Header>
        {this.renderPipelineBody()}
      </Container>
    );
  }
}

export default Pipeline;
