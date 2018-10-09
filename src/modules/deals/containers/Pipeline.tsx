import { injectGlobal } from 'emotion';
import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { colors } from '../constants';
import { queries } from '../graphql';
import { IDeal, IDealMap, IPipeline, IStageMap } from '../types';
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
  stageIds: string[];
};

class WithStages extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { dealMap } = props;

    this.state = {
      dealMap,
      stageIds: Object.keys(dealMap)
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
      const stageIds = reorder(
        this.state.stageIds,
        source.index,
        destination.index
      );

      this.setState({ stageIds });

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

  onAddDeal = (stageId: string, deal: IDeal) => {
    const { dealMap } = this.state;

    this.setState({
      dealMap: { ...dealMap, [stageId]: [...dealMap[stageId], deal] }
    });
  };

  render() {
    const { stageMap } = this.props;
    const { dealMap, stageIds } = this.state;

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
              {stageIds.map(stageId => (
                <Stage
                  onAddDeal={this.onAddDeal}
                  key={stageId}
                  stage={stageMap[stageId]}
                  deals={dealMap[stageId]}
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

  const stages = stagesQuery.dealStages;

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
