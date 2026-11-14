import { gql } from '@apollo/client';

export const AUTOMATIONS_DASHBOARD_LIST = gql`
  query automationsDashboardList($ids: [String], $limit: Int) {
    automationsMain(ids: $ids, limit: $limit) {
      list {
        _id
        name
        status
        updatedAt
      }
    }
  }
`;

// Name and the nodes stats sections label their rows with; never configs.
export const AUTOMATION_DASHBOARD_DETAIL = gql`
  query automationDashboardDetail($id: String!) {
    automationDetail(_id: $id) {
      _id
      name
      status
      actions {
        id
        type
        label
      }
      workflows {
        id
        actions
      }
    }
  }
`;

export const AUTOMATION_DASHBOARD_RUNS = gql`
  query automationDashboardRuns($automationId: String!, $limit: Int) {
    automationHistories(automationId: $automationId, limit: $limit) {
      list {
        _id
        createdAt
        automationId
        triggerId
        triggerType
        targetId
        target
        status
        description
        errorCode
        failedActionType
        handledFailureActionIds
      }
    }
  }
`;
