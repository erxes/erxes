import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ManageColumns } from '../components';

type Props = {
  contentType: string,
  fieldsQuery: any,
  location: any,
  history: any,
  fieldsDefaultColumnsConfigQuery: any
};

const ManageColumnsContainer = (props: Props) => {
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

export default compose(
  graphql<Props>(gql(queries.fieldsCombinedByContentType), {
    name: 'fieldsQuery',
    options: ({ contentType }) => {
      return {
        variables: {
          contentType
        }
      };
    }
  }),
  graphql<Props>(gql(queries.fieldsDefaultColumnsConfig), {
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
