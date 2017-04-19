import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';

// eslint-disable-next-line import/prefer-default-export
export const pagination = (queryParams, countName) => {
  let hasMore = false;
  const PER_PAGE = 20;
  const limit = parseInt(queryParams.limit, 10) || PER_PAGE;
  const listCount = Counts.get(countName);

  const loadMore = () => {
    const qParams = { limit: limit + PER_PAGE };
    FlowRouter.setQueryParams(qParams);
  };

  if (listCount > limit) {
    hasMore = true;
  }

  return {
    limit,
    loadMore,
    hasMore,
  };
};
