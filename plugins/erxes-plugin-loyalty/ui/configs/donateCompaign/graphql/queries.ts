import { commonFields } from '../../commonTypes';

export const donateCompaignFields = `
  _id
  ${commonFields}
  maxScore
  awards
`;

const donateCompaigns = `
  query donateCompaigns($searchValue: String, $filterStatus: String, $page: Int, $perPage: Int) {
    donateCompaigns(searchValue: $searchValue, filterStatus: $filterStatus, page: $page, perPage: $perPage) {
      ${donateCompaignFields}
    }
  }
`;

const donateCompaignDetail = `
  query donateCompaignDetail($_id: String) {
    donateCompaignDetail(_id: $_id) {
      ${donateCompaignFields}
    }
  }
`;

export default {
  donateCompaigns,
  donateCompaignDetail
};
