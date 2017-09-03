import { FlowRouter } from 'meteor/kadira:flow-router';

export const pagination = (queryParams, listCount) => {
  let hasMore = false;
  const PER_PAGE = 20;
  const limit = parseInt(queryParams.limit, 10) || PER_PAGE;

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
