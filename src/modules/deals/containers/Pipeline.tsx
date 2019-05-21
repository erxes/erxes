import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { EmptyState, Spinner } from '../../common/components';
import { withProps } from '../../common/utils';
import { queries } from '../graphql';
import { IDealMap, IPipeline, IStageMap, StagesQueryResponse } from '../types';
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

class WithStages extends React.Component<WithStatesQueryProps, {}> {
  componentWillReceiveProps(nextProps: Props) {
    const { stagesQuery, queryParams } = this.props;
    const { pipelineId } = queryParams;

    if (this.getQueryParams(queryParams, nextProps)) {
      stagesQuery.refetch({ pipelineId });
    }
  }

  getQueryParams = (queryParams, nextProps: Props) => {
    const {
      search,
      assignedUserIds,
      customerIds,
      productIds,
      companyIds,
      nextDay,
      nextWeek,
      nextMonth,
      noCloseDate,
      overdue
    } = queryParams;

    const nextSearch = nextProps.queryParams.search;
    const nextAssignedUserIds = nextProps.queryParams.assignedUserIds;
    const nextCustomerIds = nextProps.queryParams.customerIds;
    const nextProductIds = nextProps.queryParams.productIds;
    const nextCompanyIds = nextProps.queryParams.companyIds;
    const nextPropNextDay = nextProps.queryParams.nextDay;
    const nextPropNextWeek = nextProps.queryParams.nextWeek;
    const nextPropNextMonth = nextProps.queryParams.nextMonth;
    const nextNoCloseDate = nextProps.queryParams.noCloseDate;
    const nextOverdue = nextProps.queryParams.overdue;

    return (
      search !== nextSearch ||
      assignedUserIds !== nextAssignedUserIds ||
      customerIds !== nextCustomerIds ||
      companyIds !== nextCompanyIds ||
      productIds !== nextProductIds ||
      nextDay !== nextPropNextDay ||
      noCloseDate !== nextNoCloseDate ||
      nextWeek !== nextPropNextWeek ||
      nextMonth !== nextPropNextMonth ||
      overdue !== nextOverdue
    );
  };

  countStages(obj) {
    return Object.keys(obj).length;
  }

  render() {
    const { initialDealMap, pipeline, stageMap, queryParams } = this.props;
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

    return (
      <PipelineProvider
        pipeline={pipeline}
        initialDealMap={initialDealMap}
        queryParams={queryParams}
        getQueryParams={this.getQueryParams}
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
                          queryParams={queryParams}
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
} & Props;

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
          search: queryParams.search,
          customerIds: queryParams.customerIds,
          companyIds: queryParams.companyIds,
          assignedUserIds: queryParams.assignedUserIds,
          productIds: queryParams.productIds,
          nextDay: queryParams.nextDay,
          nextWeek: queryParams.nextWeek,
          nextMonth: queryParams.nextMonth,
          noCloseDate: queryParams.noCloseDate,
          overdue: queryParams.overdue
        }
      })
    })
  )(WithStatesQuery)
);
