import gql from 'graphql-tag';
import { Icon } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Stage } from '.';
import { queries } from '../graphql';
import { Body, Container, Header } from '../styles/pipeline';
import { IDealMap, IPipeline, IStageMap } from '../types';
import { reorder, reorderDealMap } from '../utils';

type Props = {
  pipeline: IPipeline;
  dealMap: IDealMap;
  stageMap: IStageMap;
};

type State = {
  dealMap: IDealMap;
  ordered: string[];
};

class WithStages extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { dealMap } = this.props;

    this.state = {
      dealMap,
      ordered: Object.keys(dealMap)
    };
  }

  onDragEnd = result => {
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering stage
    if (result.type === 'STAGE') {
      const ordered: string[] = reorder(
        this.state.ordered,
        source.index,
        destination.index
      );

      this.setState({
        ordered
      });

      return;
    }

    const data = reorderDealMap({
      dealMap: this.state.dealMap,
      source,
      destination
    });

    this.setState({
      dealMap: data.dealMap
    });
  };

  render() {
    const { pipeline, stageMap } = this.props;
    const { dealMap, ordered } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable
          droppableId="pipeline"
          type="STAGE"
          direction="horizontal"
          ignoreContainerClipping={true}
        >
          {provided => (
            <Container
              innerRef={provided.innerRef}
              {...provided.droppableProps}
            >
              <Header>
                <h2>
                  <Icon icon="verticalalignment" /> {pipeline.name}
                </h2>
              </Header>
              <Body innerRef={provided.innerRef} {...provided.droppableProps}>
                <div>
                  {ordered.map((key: string) => (
                    <Stage
                      key={key}
                      deals={dealMap[key]}
                      stage={stageMap[key]}
                    />
                  ))}
                </div>
              </Body>
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

const WithStatesQuery = props => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return null;
  }

  const stages = stagesQuery.dealStages;
  const dealMap: IDealMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    dealMap[stage._id] = stage.deals;
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} dealMap={dealMap} stageMap={stageMap} />;
};

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }: { pipeline: IPipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(WithStatesQuery);
