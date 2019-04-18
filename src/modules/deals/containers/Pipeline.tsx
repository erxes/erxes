import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { EmptyState, Spinner } from '../../common/components';
import { mutations, queries } from '../graphql';
import {
  DealsChangeMutation,
  IDealMap,
  IPipeline,
  IStageMap,
  StagesQueryResponse
} from '../types';
import { PipelineConsumer, PipelineProvider } from './PipelineContext';
import { Stage } from './stage';

const Container = styled.div`
  height: 100%;
  display: inline-flex;
`;

type Props = {
  pipeline: IPipeline;
  initialDealMap?: IDealMap;
  stageMap?: IStageMap;
  queryParams: any;
};

type FinalProps = {
  dealsChangeMutation: DealsChangeMutation;
} & Props;

class WithStages extends React.Component<FinalProps, {}> {
  countStages(obj) {
    return Object.keys(obj).length;
  }

  render() {
    const {
      initialDealMap,
      pipeline,
      stageMap,
      queryParams,
      dealsChangeMutation
    } = this.props;
    const stagesCount = this.countStages(stageMap);

    if (stagesCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No stage in this pipeline"
          size="small"
        />
      );
    }

    const dealsChange = (id: string) => {
      dealsChangeMutation({ variables: { _id: id } }).catch(error => {
        Alert.error(error.message);
      });
    };

    return (
      <PipelineProvider
        pipeline={pipeline}
        initialDealMap={initialDealMap}
        queryParams={queryParams}
        dealsChange={dealsChange}
      >
        <PipelineConsumer>
          {({ stageLoadMap, dealMap, onDragEnd, stageIds }) => (
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
                    {stageIds.map((stageId, index) => {
                      const stage = stageMap && stageMap[stageId];

                      if (!stage) {
                        return null;
                      }

                      return (
                        <Stage
                          key={stageId}
                          index={index}
                          length={stagesCount}
                          stage={stage}
                          deals={dealMap[stageId]}
                          search={queryParams.search}
                          loadingState={stageLoadMap[stageId]}
                        />
                      );
                    })}
                    {provided.placeholder}
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

type WithStatesQueryProps = {
  stagesQuery: StagesQueryResponse;
} & FinalProps;

const WithStatesQuery = (props: WithStatesQueryProps) => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery.dealStages;

  const dealMap: IDealMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    dealMap[stage._id] = [];
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} stageMap={stageMap} initialDealMap={dealMap} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ pipeline, queryParams }) => ({
        variables: {
          pipelineId: pipeline._id,
          search: queryParams.search
        }
      })
    }),
    graphql<Props, DealsChangeMutation>(gql(mutations.dealsChange), {
      name: 'dealsChangeMutation'
    })
  )(WithStatesQuery)
);
