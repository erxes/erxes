import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';


const propTypes = {
  perPage: PropTypes.number,
  all: PropTypes.number.isRequired,
  paramName: PropTypes.string,
};

function LoadMore({ perPage = 20, all, paramName = 'limit' }) {
  const loaded = parseInt(FlowRouter.getQueryParam(paramName), 10) || perPage;

  const load = () => {
    FlowRouter.setQueryParams({ [paramName]: loaded + perPage });
  };

  return (
    loaded < all ? <button onClick={load}>Load more</button> : null
  );
}

LoadMore.propTypes = propTypes;

export default LoadMore;
