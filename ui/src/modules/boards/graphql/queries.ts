import { queries as boardQueries } from 'erxes-ui/lib/boards/graphql';

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
  customers{
    _id
  }
  companies{
    _id
  }
  assignedUserIds
`;

const tasks = `
  query tasks($pipelineId: String, $stageId: String, $limit: Int) {
    tasks(pipelineId: $pipelineId, stageId: $stageId, limit: $limit) {
      ${cardFields}
    }
  } 
`;

const tickets = `
  query tickets($pipelineId: String, $stageId: String, $limit: Int) {
    tickets(pipelineId: $pipelineId, stageId: $stageId, limit: $limit) {
      ${cardFields}
    }
  } 
`;

const deals = `
  query deals($pipelineId: String, $stageId: String, $limit: Int) {
    deals(pipelineId: $pipelineId, stageId: $stageId, limit: $limit) {
      ${cardFields}
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
  pipelineLabels,
  pipelineLabelDetail,
  tasks,
  deals,
  tickets
};
