import { commonFields } from '../../commonTypes';

export const spinCompaignFields = `
  _id
  ${commonFields}
  byScore
  awards
`;

const spinCompaigns = `
  query spinCompaigns($searchValue: String, $filterStatus: String, $page: Int, $perPage: Int) {
    spinCompaigns(searchValue: $searchValue, filterStatus: $filterStatus, page: $page, perPage: $perPage) {
      ${spinCompaignFields}
    }
  }
`;

const spinCompaignDetail = `
  query spinCompaignDetail($_id: String) {
    spinCompaignDetail(_id: $_id) {
      ${spinCompaignFields}
    }
  }
`;

export default {
  spinCompaigns,
  spinCompaignDetail
};
