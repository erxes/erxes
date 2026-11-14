import { gql } from '@apollo/client';
import { DASHBOARD_LAYOUT_ITEM_FIELDS } from '@/home/dashboard/graphql/dashboardLayoutQueries';

export const DASHBOARD_LAYOUT_SAVE = gql`
  mutation dashboardLayoutSave($items: [DashboardLayoutItemInput!]!) {
    dashboardLayoutSave(items: $items) {
      _id
      items {
        ${DASHBOARD_LAYOUT_ITEM_FIELDS}
      }
    }
  }
`;

export const DASHBOARD_LAYOUT_RESET = gql`
  mutation dashboardLayoutReset {
    dashboardLayoutReset
  }
`;
