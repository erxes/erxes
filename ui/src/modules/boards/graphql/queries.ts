import { queries as boardQueries } from 'erxes-ui/lib/boards/graphql';
import * as teamQueries from 'erxes-ui/lib/team/graphql';

const detailFields = teamQueries.detailFields;

const pipelineLabelFields = `
  _id
  name
  colorCode
  pipelineId
  createdBy
  createdAt
`;

const pipelineLabels = `
  query pipelineLabels($pipelineId: String!) {
    pipelineLabels(pipelineId: $pipelineId) {
      ${pipelineLabelFields}
    }
  }
`;

const pipelineAssignedUsers = `
  query pipelineAssignedUsers($_id: String!) {
    pipelineAssignedUsers(_id: $_id) {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

const pipelineLabelDetail = `
  query pipelineLabelDetail($_id: String!) {
    pipelineLabelDetail(_id: $_id) {
      ${pipelineLabelFields}
    }
  }
`;

const boards = boardQueries.boards;

const boardGetLast = `
  query boardGetLast($type: String!) {
    boardGetLast(type: $type) {
      _id
      name
      pipelines {
        _id
        name
      }
    }
  }
`;

const boardDetail = `
  query boardDetail($_id: String!) {
    boardDetail(_id: $_id) {
      _id
      name
      pipelines {
        _id
        name
        visibility
        memberIds
        isWatched
        startDate
        endDate
        state
        itemsTotalCount
        members {
          _id
          email
          username
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

const pipelines = boardQueries.pipelines;

const pipelineDetail = `
  query pipelineDetail($_id: String!) {
    pipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      isWatched
      hackScoringType
    }
  }
`;

const commonParams = boardQueries.commonParams;

const commonParamDefs = boardQueries.commonParamDefs;

const stageParams = boardQueries.stageParams;

const stageParamDefs = boardQueries.stageParamDefs;

const stageCommon = boardQueries.stageCommon;

const stages = boardQueries.stages;

const conversionStages = `
  query stages(
    ${stageParams}
  ) {
    stages(
      ${stageParamDefs}
    ) {
      ${stageCommon}
      compareNextStage
      initialDealsTotalCount
      stayedDealsTotalCount
      inProcessDealsTotalCount
    }
  }
`;

const archivedStages = `
  query archivedStages(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    archivedStages(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      _id
      name
    }
  }
`;

const archivedStagesCount = `
  query archivedStagesCount(
    $pipelineId: String!,
    $search: String
  ) {
    archivedStagesCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

const stageDetail = `
  query stageDetail(
    $_id: String!,
    ${commonParams}
  ) {
    stageDetail(
      _id: $_id,
      ${commonParamDefs}
    ) {
      _id
      name
      pipelineId
      amount
      itemsTotalCount
    }
  }
`;

const boardCounts = `
  query boardCounts($type: String!) {
    boardCounts(type: $type) {
      _id
      name
      count
    }
  }
`;

const cardFields = `
  _id
  name
  customers
  companies
  assignedUsers
`;

const boardItemQueryParamsDef = `
  $pipelineId: String,
  $stageId: String,
  $limit: Int
`;

const boardItemQueryParams = `
  pipelineId: $pipelineId,
  stageId: $stageId,
  limit: $limit
`;

const tasks = `
  query tasks(${boardItemQueryParamsDef}) {
    tasks(${boardItemQueryParams}) {
      ${cardFields}
    }
  } 
`;

const tickets = `
  query tickets(${boardItemQueryParamsDef}) {
    tickets(${boardItemQueryParams}) {
      ${cardFields}
    }
  } 
`;

const deals = `
  query deals(${boardItemQueryParamsDef}) {
    deals(${boardItemQueryParams}) {
      ${cardFields}
    }
  } 
`;

const itemsCountBySegments = `
  query itemsCountBySegments($type: String!, $boardId: String, $pipelineId: String) {
    itemsCountBySegments(type: $type, boardId: $boardId, pipelineId: $pipelineId)
  } 
`;

const activityLogsByAction = `
  query activityLogsByAction(
    $contentType: String,
    $action: String,
    $pipelineId: String
    $perPage: Int,
    $page: Int
  ) {
    activityLogsByAction(
      contentType: $contentType,
      action: $action,
      pipelineId: $pipelineId,
      perPage: $perPage,
      page: $page,
    ) {
      activityLogs {
        _id
        createdUser {
          _id
          username
          email
          
          details {
            ${detailFields}
          }
        }

        action
        content
        createdAt
        contentType
        contentTypeDetail
      }

      totalCount
    }
  }
`;

export default {
  archivedStages,
  archivedStagesCount,
  boards,
  boardGetLast,
  boardDetail,
  boardCounts,
  pipelines,
  pipelineDetail,
  stages,
  conversionStages,
  stageDetail,
  pipelineAssignedUsers,
  pipelineLabels,
  pipelineLabelDetail,
  itemsCountBySegments,
  tasks,
  deals,
  tickets,
  activityLogsByAction
};
