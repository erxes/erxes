import { injectGlobal } from 'emotion';
import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { colors } from '../constants';
import generateFakeData from '../data';
import { queries } from '../graphql';
import { IDealMap, IPipeline, IStageMap } from '../types';
import { reorder, reorderDealMap } from '../utils';
import Stage from './Stage';

const Container = styled.div`
  min-height: 100vh;

  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  display: inline-flex;
`;

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

    const { dealMap } = props;

    this.state = {
      dealMap,
      ordered: Object.keys(dealMap)
    };
  }

  componentDidMount() {
    injectGlobal`
      body {
        background: ${colors.blue.deep};
      }
    `;
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
              {ordered.map((key: string, index: number) => (
                <Stage
                  key={key}
                  index={index}
                  title={key}
                  deals={dealMap[key]}
                />
              ))}
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

  const stages = generateFakeData(props.pipeline, 10, 50);

  const dealMap: IDealMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    dealMap[stage._id] = stage.deals;
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} stageMap={stageMap} dealMap={dealMap} />;
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
