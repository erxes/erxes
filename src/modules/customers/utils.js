import { LEAD_STATUS_TYPES, LIFECYCLE_STATE_TYPES } from './constants';

export const hasAnyActivity = log => {
  let hasAny = false;

  log.forEach(item => {
    if (item.list.length > 0) {
      hasAny = true;
    }
  });

  return hasAny;
};

export const leadStatusChoices = __ => {
  const options = [];

  for (const key of Object.keys(LEAD_STATUS_TYPES)) {
    options.push({
      value: key,
      label: __(LEAD_STATUS_TYPES[key])
    });
  }

  return options;
};

export const lifecycleStateChoices = __ => {
  const options = [];

  for (const key of Object.keys(LIFECYCLE_STATE_TYPES)) {
    options.push({
      value: key,
      label: __(LIFECYCLE_STATE_TYPES[key])
    });
  }

  return options;
};

export const generateListQueryVariables = ({ queryParams }) => ({
  page: queryParams.page,
  perPage: queryParams.perPage || 20,
  segment: queryParams.segment,
  tag: queryParams.tag,
  ids: queryParams.ids,
  searchValue: queryParams.searchValue,
  brand: queryParams.brand,
  integration: queryParams.integrationType,
  form: queryParams.form,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  leadStatus: queryParams.leadStatus,
  lifecycleState: queryParams.lifecycleState,
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
});
