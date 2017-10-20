import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'react-apollo';
import { pagination, Loading } from 'modules/common/components';

const commonListComposer = options => {
  const { name, gqlListQuery, gqlTotalCountQuery, ListComponent } = options;

  const ListContainer = props => {
    const { listQuery, totalCountQuery, queryParams } = props;

    if (totalCountQuery.loading || listQuery.loading) {
      return <Loading title="Settings" />;
    }

    const totalCount = totalCountQuery[`${name}TotalCount`];
    const objects = listQuery[name];

    const { loadMore, hasMore } = pagination(queryParams, totalCount);

    // remove action
    const remove = () => {
    };

    // create or update action
    const save = () => {};

    const updatedProps = {
      ...this.props,
      refetch: listQuery.refetch,
      objects,
      loadMore,
      hasMore,
      save,
      remove,
    };

    return <ListComponent {...updatedProps} />;
  };

  ListContainer.propTypes = {
    totalCountQuery: PropTypes.object,
    listQuery: PropTypes.object,
    queryParams: PropTypes.object,
  };

  return compose(gqlListQuery, gqlTotalCountQuery)(ListContainer);
};

export default commonListComposer;
