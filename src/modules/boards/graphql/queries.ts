import { queries as dealQueries } from 'modules/deals/graphql';
import { queries as ticketQueries } from 'modules/tickets/graphql';

const boards = `
  query boards($type: String!) {
    boards(type: $type) {
      _id
      name

      pipelines {
        _id
        name
      }
    }
  }
`;

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
      }
    }
  }
`;

const pipelines = `
  query pipelines($boardId: String!) {
    pipelines(boardId: $boardId) {
      _id
      name
      boardId
    }
  }
`;

const pipelineDetail = `
  query pipelineDetail($_id: String!) {
    pipelineDetail(_id: $_id) {
      _id
      name
    }
  }
`;

const stages = `
  query stages($pipelineId: String!, $search: String) {
    stages(pipelineId: $pipelineId, search: $search) {
      _id
      name
      order
      amount
      itemsTotalCount
    }
  }
`;

const stageDetail = `
  query stageDetail($_id: String!) {
    stageDetail(_id: $_id) {
      _id
      name
      pipelineId
      amount
      itemsTotalCount
    }
  }
`;

export default {
  deals: dealQueries.deals,
  tickets: ticketQueries.tickets,
  boards,
  boardGetLast,
  boardDetail,
  pipelines,
  pipelineDetail,
  stages,
  stageDetail
};
