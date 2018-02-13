import React from 'react';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Board } from '../components';

import { queries } from '../graphql';

class HomeContainer extends Bulk {
  render() {
    return <Board />;
  }
}

export default compose(
  graphql(gql(queries.dealBoards), {
    name: 'dealBoardsQuery'
  })
)(withRouter(HomeContainer));
