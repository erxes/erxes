import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import ManageColumns from '../components/ManageColumns';
import {
  DefaultColumnsConfigQueryResponse,
  FieldsCombinedByTypeQueryResponse
} from '../types';

type Props = {
  contentType: string;
  location: any;
  history: any;
  closeModal: () => void;
};

type FinalProps = {
  fieldsDefaultColumnsConfigQuery: DefaultColumnsConfigQueryResponse;
  fieldsQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

const ManageColumnsContainer = (props: FinalProps) => {
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
  const storageItem = localStorage.getItem(storageKey);

  const save = config => {
    localStorage.setItem(storageKey, JSON.stringify(config));

    Alert.success('Success');

    if (history && location) {
      history.push(location.pathname);
    }
  };

  let columnsConfig =
    fieldsDefaultColumnsConfigQuery.fieldsDefaultColumnsConfig;

  if (storageItem) {
    columnsConfig = JSON.parse(storageItem);
  }

  const updatedProps = {
    ...props,
    config: columnsConfig,
    save,
    fields: fieldsQuery.fieldsCombinedByContentType
  };

  return <ManageColumns {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsCombinedByTypeQueryResponse, { contentType: string }>(
      gql(queries.fieldsCombinedByContentType),
      {
        name: 'fieldsQuery',
        options: ({ contentType }) => {
          return {
            variables: {
              contentType
            }
          };
        }
      }
    ),
    graphql<Props, DefaultColumnsConfigQueryResponse, { contentType: string }>(
      gql(queries.fieldsDefaultColumnsConfig),
      {
        name: 'fieldsDefaultColumnsConfigQuery',
        options: ({ contentType }) => {
          return {
            variables: {
              contentType
            }
          };
        }
      }
    )
  )(ManageColumnsContainer)
);
