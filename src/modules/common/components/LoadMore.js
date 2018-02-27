import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { Button } from 'modules/common/components';

const propTypes = {
  history: PropTypes.object.isRequired,
  perPage: PropTypes.number,
  all: PropTypes.number.isRequired,
  paramName: PropTypes.string
};

function LoadMore({ history, perPage = 20, all, paramName = 'limit' }, { __ }) {
  const loaded = parseInt(router.getParam(history, paramName), 10) || perPage;

  const load = () => {
    router.setParams(history, { limit: loaded + perPage });
  };

  return loaded < all ? (
    <Button block btnStyle="link" onClick={load}>
      {__('Load more')}
    </Button>
  ) : null;
}

LoadMore.propTypes = propTypes;
LoadMore.contextTypes = {
  __: PropTypes.func
};

export default withRouter(LoadMore);
