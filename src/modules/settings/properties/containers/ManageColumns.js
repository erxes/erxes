import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ManageColumns } from '../components';
import { queries } from 'modules/forms/graphql';

const ManageColumnsContainer = props => {
  const {
    fieldsDefaultColumnsConfigQuery,
    fieldsQuery,
    contentType,
    location,
    history
  } = props;

  if (fieldsQuery.loading || fieldsDefaultColumnsConfigQuery.loading) {
    return false;
  }

  const storageKey = `erxes_${contentType}_columns_config`;

  const save = config => {
    localStorage.setItem(storageKey, JSON.stringify(config));

    Alert.success('Success');

    if (history && location) {
      history.push(location.pathname);
    }
  };

  let config = fieldsDefaultColumnsConfigQuery.fieldsDefaultColumnsConfig;

  if (localStorage.getItem(storageKey)) {
    config = JSON.parse(localStorage.getItem(storageKey));
  }

  const updatedProps = {
    ...props,
    config,
    save,
    fields: fieldsQuery.fieldsCombinedByContentType
  };

  return <ManageColumns {...updatedProps} />;
};

ManageColumnsContainer.propTypes = {
  contentType: PropTypes.string,
  fieldsQuery: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  fieldsDefaultColumnsConfigQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.fieldsCombinedByContentType), {
    name: 'fieldsQuery',
    options: ({ contentType }) => {
      return {
        variables: {
          contentType
        }
      };
    }
  }),
  graphql(gql(queries.fieldsDefaultColumnsConfig), {
    name: 'fieldsDefaultColumnsConfigQuery',
    options: ({ contentType }) => {
      return {
        variables: {
          contentType
        }
      };
    }
  })
)(ManageColumnsContainer);
