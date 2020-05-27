import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import ManageColumns from '../components/ManageColumns';
import {
  DefaultColumnsConfigQueryResponse,
  FieldsCombinedByTypeQueryResponse,
  IConfigColumn
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

  const defaultColumns = fieldsDefaultColumnsConfigQuery.fieldsDefaultColumnsConfig;

  let columns: IConfigColumn[] = [];

  if (storageItem) {
    columns = JSON.parse(storageItem);
  } else {
    const defaultColumnsMap = {};

    defaultColumns.forEach(col => {
      defaultColumnsMap[col.name] = col;
    });

    columns = (fieldsQuery.fieldsCombinedByContentType || [])
      .map((field) => {
        const conf = defaultColumnsMap[field.name];

        return {
          ...field,
          _id: Math.random().toString(),
          order: conf ? conf.order : 0,
          checked: conf
        }
      })
      .sort((a, b) => a.order - b.order);
  }

  const updatedProps = {
    ...props,
    save,
    columns
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
              contentType,
              excludedNames: [
                'state',
                'avatar',
                'ownerId',
                'status',
                'integrationId',
                'emailValidationStatus',
                'location.countryCode'
              ]
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
