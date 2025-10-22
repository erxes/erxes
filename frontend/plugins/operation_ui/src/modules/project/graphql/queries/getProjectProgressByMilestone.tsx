import gql from 'graphql-tag';

export const GET_PROJECT_PROGRESS_BY_MILESTONE = gql`
  query GetMilestoneProgress($projectId: String!) {
    milestoneProgress(projectId: $projectId) {
      _id
      name
      targetDate
      totalScope
      totalStartedScope
      totalCompletedScope
    }
  }
`;
