import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';


export const pagination = (queryParams, countName) => {
  let hasMore = false;
  const PER_PAGE = 10;
  const limit = parseInt(queryParams.limit, 10) || 2;
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
