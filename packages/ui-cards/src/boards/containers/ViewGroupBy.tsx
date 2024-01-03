import * as compose from 'lodash.flowright';

import React, { Component } from 'react';
import { IOptions, IPipeline, StagesQueryResponse } from '../types';
import { gql } from '@apollo/client';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { withProps } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import styled from 'styled-components';
import { PRIORITIES } from '../constants';
import ListGroupBy from './ListGroupBy';
import GanttChart from './gantt/GanttChart';
import TimeItems from './time/TimeItems';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { AllUsersQueryResponse } from '@erxes/ui/src/auth/types';
import { queries as userQueries } from '@erxes/ui/src/team/graphql';

const Container = styled.div`
  min-height: 500px;
  overflow: auto;
  background-color: white;
`;

type Props = {
  pipeline: IPipeline;
  queryParams: any;
  options: IOptions;
  viewType: string;
};

type WithStagesProps = {
  stagesQuery: any;
  pipelineLabelsQuery: any;
  pipelineAssigneeQuery: any;
  tagsQuery?: TagsQueryResponse;
  usersQuery: AllUsersQueryResponse;
} & Props;

class WithStages extends Component<WithStagesProps> {
  render() {
    const {
      options,
      queryParams,
      stagesQuery,
      pipelineLabelsQuery,
      pipelineAssigneeQuery,
      viewType,
      pipeline,
      tagsQuery,
      usersQuery
    } = this.props;

    let groupType = 'stage';
    let groups: any[] = stagesQuery.stages || [];

    if (queryParams.groupBy === 'label') {
      groups = pipelineLabelsQuery.pipelineLabels || [];
      groupType = 'label';
    }

    if (queryParams.groupBy === 'priority') {
      groups = PRIORITIES.map(p => ({ _id: p, name: p } || []));
      groupType = 'priority';
    }

    if (queryParams.groupBy === 'assignee') {
      groups = pipelineAssigneeQuery.pipelineAssignedUsers || [];
      groupType = 'assignee';
    }

    if (queryParams.groupBy === 'dueDate') {
      const renderLink = () => [
        {
          _id: 'overDue',
          name: 'Overdue',
          value: 'overdue'
        },
        {
          _id: 'dueTomorrow',
          name: 'Due tomorrow',
          value: 'nextDay'
        },
        {
          _id: 'dueWeek',
          name: 'Due next week',
          value: 'nextWeek'
        },
        {
          _id: 'dueMonth',
          name: 'Due next month',
          value: 'nextMonth'
        },
        {
          _id: 'noCloseDate',
          name: 'Has no close date',
          value: 'noCloseDate'
        }
      ];
      groups = renderLink();
      groupType = 'dueDate';
    }

    if (queryParams.groupBy === 'tags') {
      groups = tagsQuery?.tags || [];
      groupType = 'tags';
    }

    if (queryParams.groupBy === 'members') {
      groups = usersQuery.allUsers || [];
      groupType = 'members';
    }

    if (groups.length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No value in this pipeline"
          size="large"
          light={true}
        />
      );
    }

    if (viewType === 'gantt') {
      return (
        <GanttChart
          key={pipeline._id}
          options={options}
          queryParams={queryParams}
          groups={groups}
          groupType={groupType}
        />
      );
    }

    if (viewType === 'time') {
      return (
        <TimeItems
          key={pipeline._id}
          pipeline={pipeline}
          queryParams={queryParams}
          options={options}
          type={options.type}
          groupType={groupType}
          groups={groups}
        />
      );
    }

    return (
      <Container>
        {groups.map((groupObj, index) => (
          <ListGroupBy
            key={groupObj._id}
            options={options}
            groupObj={groupObj}
            groupType={groupType}
            index={index}
            length={groups.length}
            queryParams={queryParams}
            refetchStages={stagesQuery.refetch}
          />
        ))}
      </Container>
    );
  }
}

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
          userIds: queryParams.userIds,
          assignedToMe: queryParams.assignedToMe
        }
      })
    }),
    graphql<Props, StagesQueryResponse>(gql(queries.pipelineLabels), {
      name: 'pipelineLabelsQuery',
      options: ({ pipeline }) => ({
        variables: {
          pipelineId: pipeline._id
        }
      })
    }),
    graphql<Props, StagesQueryResponse>(gql(queries.pipelineAssignedUsers), {
      name: 'pipelineAssigneeQuery',
      options: ({ pipeline }) => ({
        variables: {
          _id: pipeline._id
        }
      })
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      skip: ({ pipeline }: Props) => pipeline.tagId === '',
      options: ({ pipeline, options }: Props) => ({
        variables: {
          type: `cards:${options.type}`,
          parentId: pipeline.tagId
        }
      })
    }),
    graphql<Props, AllUsersQueryResponse>(gql(userQueries.allUsers), {
      name: 'usersQuery',
      options: ({ queryParams }) => ({
        variables: {
          isActive: true,
          assignedToMe: queryParams?.assignedToMe,
          ids: queryParams?.assignedUserIds
        }
      })
    })
  )(WithStages)
);
