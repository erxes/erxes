import { gql } from '@apollo/client';

export const UPDATE_CYCLE = gql`
  mutation UpdateCycle($input: CycleInput!) {
    updateCycle(input: $input) {
      _id
      name
      description
      startDate
      endDate
      teamId
      isCompleted
      isActive
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
      donePercent
      unFinishedTasks
    }
  }
`;
