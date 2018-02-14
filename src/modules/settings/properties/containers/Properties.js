import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import { Properties } from '../components';

const PropertiesContainer = props => {
  const { fieldsQuery, history } = props;
  const fieldsgroups = fieldsQuery.fieldsgroups || [];

  if (!router.getParam(history, 'type')) {
    router.setParams(history, { type: 'Customer' });
  }

  const currentType = router.getParam(history, 'type');

  const updatedProps = {
    ...props,
    fieldsgroups,
    currentType
  };

  return <Properties {...updatedProps} />;
};

PropertiesContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsQuery: PropTypes.object,
  history: PropTypes.object
};

export default compose(
  graphql(gql(queries.fieldsgroups), {
    name: 'fieldsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  })
)(withRouter(PropertiesContainer));
