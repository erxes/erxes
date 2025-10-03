import { gql } from '@apollo/client';

export const AUTOMATIONS_BOTS_CONSTANTS = gql`
  query AutomationBotsConstants {
    automationBotsConstants
  }
`;

export const AUTOMATION_BOTS_TOTAL_COUNT = (queryName: string) => {
  if (!queryName) {
    throw new Error('queryName is required for AUTOMATION_BOTS_TOTAL_COUNT');
  }

  return gql`
    query ${queryName} {
      ${queryName}
    }
  `;
};
