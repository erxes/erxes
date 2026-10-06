import { gql } from '~/gql';

export const GET_CYCLE_DETAIL = gql(`
  query GetCycleDetail($_id: String!) {
    getCycle(_id: $_id) {
      _id
      description
      donePercent
      endDate
      isActive
      isCompleted
      name
      startDate
      statistics {
        progress {
          totalScope
          totalStartedScope
          totalCompletedScope
        }
        progressByMember {
          assigneeId
          totalScope
          totalStartedScope
          totalCompletedScope
        }
        progressByProject {
          projectId
          totalScope
          totalStartedScope
          totalCompletedScope
        }
        chartData {
          totalScope
          chartData {
            date
            started
            completed
          }
        }
      }
      teamId
      unFinishedTasks
    }
  }
`);
