import { gql } from '@apollo/client';

export const DASHBOARD_LAYOUT_ITEM_FIELDS = `
  id
  type
  x
  y
  w
  h
  config
`;

export const DASHBOARD_LAYOUT_BY_CURRENT_USER = gql`
  query dashboardLayoutByCurrentUser {
    dashboardLayoutByCurrentUser {
      _id
      items {
        ${DASHBOARD_LAYOUT_ITEM_FIELDS}
      }
    }
  }
`;
