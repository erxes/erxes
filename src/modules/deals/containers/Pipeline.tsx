import { injectGlobal } from 'emotion';
import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { colors } from '../constants';
import { queries } from '../graphql';
import { IDealMap, IPipeline, IStageMap } from '../types';
import { PipelineConsumer, PipelineProvider } from './PipelineContext';
import Stage from './Stage';

const Container = styled.div`
  min-height: 100vh;

  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  display: inline-flex;
`;

type Props = {
  pipeline: IPipeline;
  initialDealMap: IDealMap;
  stageMap: IStageMap;
};

class WithStages extends React.Component<Props, {}> {
  componentDidMount() {
    injectGlobal`
      body {
        background: ${colors.blue.deep};
      }
    `;
  }

  render() {
    const { initialDealMap, stageMap } = this.props;

    return (
      <PipelineProvider initialDealMap={initialDealMap}>
        <PipelineConsumer>
          {({ dealMap, onDragEnd, stageIds }) => (
            <DragDropContext onDragEnd={onDragEnd}>
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
                    {stageIds.map((stageId, index) => (
                      <Stage
                        key={stageId}
                        index={index}
                        stage={stageMap[stageId]}
                        deals={dealMap[stageId]}
                      />
                    ))}
                  </Container>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </PipelineConsumer>
      </PipelineProvider>
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

  return <WithStages {...props} stageMap={stageMap} initialDealMap={dealMap} />;
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
