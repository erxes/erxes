import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { queries } from '../graphql';
import {
  IItemMap,
  IOptions,
  IPipeline,
  IStageMap,
  StagesQueryResponse
} from '../types';
import { PipelineConsumer, PipelineProvider } from './PipelineContext';
import Stage from './Stage';

const Container = styled.div`
  height: 100%;
  display: inline-flex;
`;

type Props = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  stageMap?: IStageMap;
  queryParams: any;
  options: IOptions;
};

class WithStages extends Component<WithStagesQueryProps> {
  componentWillReceiveProps(nextProps: Props) {
    const { stagesQuery, queryParams } = this.props;
    const { pipelineId } = queryParams;

    if (this.queryParamsChanged(queryParams, nextProps.queryParams)) {
      stagesQuery.refetch({ pipelineId });
    }
  }

  queryParamsChanged = (queryParams: any, nextQueryParams: any) => {
    if (nextQueryParams.itemId || (!queryParams.key && queryParams.itemId)) {
      return false;
    }

    if (queryParams !== nextQueryParams) {
      return true;
    }

    return false;
  };

  countStages(obj) {
    return Object.keys(obj).length;
  }

  render() {
    const {
      initialItemMap,
      pipeline,
      stageMap,
      options,
      queryParams,
      stagesQuery
    } = this.props;

    const stagesCount = this.countStages(stageMap);

    if (stagesCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No stage in this pipeline"
          size="small"
          light={true}
        />
      );
    }

    return (
      <PipelineProvider
        pipeline={pipeline}
        initialItemMap={initialItemMap}
        queryParams={queryParams}
        options={options}
        queryParamsChanged={this.queryParamsChanged}
      >
        <PipelineConsumer>
          {({
            stageLoadMap,
            itemMap,
            onDragEnd,
            stageIds,
            scheduleStage,
            onLoadStage,
            onAddItem,
            onRemoveItem
          }) => (
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
                          options={options}
                          key={stageId}
                          index={index}
                          length={stagesCount}
                          stage={stage}
                          items={itemMap[stageId]}
                          queryParams={queryParams}
                          loadingState={stageLoadMap[stageId]}
                          refetchStages={stagesQuery.refetch}
                          scheduleStage={scheduleStage}
                          onLoad={onLoadStage}
                          onAddItem={onAddItem}
                          onRemoveItem={onRemoveItem}
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

type WithStagesQueryProps = {
  stagesQuery: StagesQueryResponse;
} & IRouterProps &
  Props;

const WithStagesQuery = (props: WithStagesQueryProps) => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery.stages || [];

  const itemMap: IItemMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    itemMap[stage._id] = [];
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} stageMap={stageMap} initialItemMap={itemMap} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ pipeline, queryParams, options: { getExtraParams } }) => ({
        variables: {
          pipelineId: pipeline._id,
          search: queryParams.search,
          customerIds: queryParams.customerIds,
          companyIds: queryParams.companyIds,
          assignedUserIds: queryParams.assignedUserIds,
          labelIds: queryParams.labelIds,
          extraParams: getExtraParams(queryParams),
          closeDateType: queryParams.closeDateType,
          userIds: queryParams.userIds
        }
      })
    })
  )(withRouter(WithStagesQuery))
);
