import { Button } from 'modules/common/components';
import { router } from 'modules/common/utils';
import * as React from 'react';
import { withRouter } from 'react-router';

type Props = {
  history: any,
  location: any,
  match: any,
  perPage: number,
  all: number,
  paramName?: string,
  loading?: boolean
};

function LoadMore({
  history,
  perPage = 20,
  all,
  paramName = 'limit',
  loading
}: Props) {
  const loaded = parseInt(router.getParam(history, paramName), 10) || perPage;

  const load = () => {
    router.setParams(history, { limit: loaded + perPage });
  };

  return loaded < all ? (
    <Button block btnStyle="link" onClick={load} icon="downarrow">
      {loading ? 'Loading...' : 'Load more'}
    </Button>
  ) : null;
}

export default withRouter(LoadMore);