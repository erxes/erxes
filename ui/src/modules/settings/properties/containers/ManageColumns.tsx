import { getEnv } from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import ManageColumns from '../components/ManageColumns';

import {
  DefaultColumnsConfigQueryResponse,
  FieldsCombinedByTypeQueryResponse,
  IConfigColumn,
} from '../types';

type Props = {
  contentType: string;
  type: string;
  location?: any;
  history?: any;
  closeModal: () => void;
};

type FinalProps = {
  fieldsDefaultColumnsConfigQuery: DefaultColumnsConfigQueryResponse;
  fieldsQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

const { REACT_APP_API_URL } = getEnv();

const ManageColumnsContainer = (props: FinalProps) => {
  const {
    fieldsDefaultColumnsConfigQuery,
    fieldsQuery,
    contentType,
    location,
    history,
    type,
  } = props;

  if (fieldsQuery.loading || fieldsDefaultColumnsConfigQuery.loading) {
    return false;
  }

  const storageKey = `erxes_${contentType}_columns_config`;
  const storageItem = localStorage.getItem(storageKey);

  let save = (config: any, importType?: string) => {
    localStorage.setItem(storageKey, JSON.stringify(config));

    Alert.success('Success');

    if (history && location) {
      history.push(location.pathname);
    }
  };

  if (type && (type === 'import' || type === 'export')) {
    save = (configs, importType) => {
      const checkedConfigsForImport: string[] = [];
      const checkedConfigsForExport: any[] = [];

      let reqUrl = '/template-export';

      if (type === 'export') {
        reqUrl = '/file-export';
      }

      configs
        .filter((conf) => conf.checked)
        .forEach((checked) => {
          if (checked.name.startsWith('customFieldsData')) {
            checkedConfigsForExport.push(checked);
            checkedConfigsForImport.push(checked.label);
          } else {
            checkedConfigsForExport.push(checked);
            checkedConfigsForImport.push(checked.name);
          }
        });

      const stringified = queryString.stringify({
        configs:
          type === 'export'
            ? JSON.stringify(checkedConfigsForExport)
            : checkedConfigsForImport,
        type: contentType,
        importType,
        fromHistory: true,
      });

      window.open(`${REACT_APP_API_URL}${reqUrl}?${stringified}`, '_blank');
    };
  }

  const defaultColumns =
    fieldsDefaultColumnsConfigQuery.fieldsDefaultColumnsConfig;

  let columns: IConfigColumn[] = [];

  if (storageItem) {
    columns = JSON.parse(storageItem);
  } else {
    const defaultColumnsMap = {};

    defaultColumns.forEach((col) => {
      defaultColumnsMap[col.name] = col;
    });

    columns = (fieldsQuery.fieldsCombinedByContentType || [])
      .map((field) => {
        const conf = defaultColumnsMap[field.name];

        return {
          ...field,
          _id: Math.random().toString(),
          order: conf ? conf.order : 0,
          checked: conf,
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  const updatedProps = {
    ...props,
    save,
    columns,
  };

  return <ManageColumns {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsCombinedByTypeQueryResponse, { contentType: string }>(
      gql(queries.fieldsCombinedByContentType),
      {
        name: 'fieldsQuery',
        options: ({ contentType, type }) => {
          return {
            variables: {
              contentType: contentType === 'lead' ? 'customer' : contentType,
              usageType: type,
              excludedNames: [
                'state',
                'avatar',
                'ownerId',
                'status',
                'integrationId',
                'categoryId',
                'emailValidationStatus',
                'phoneValidationStatus',
                'location.countryCode',
              ],
            },
          };
        },
      }
    ),
    graphql<Props, DefaultColumnsConfigQueryResponse, { contentType: string }>(
      gql(queries.fieldsDefaultColumnsConfig),
      {
        name: 'fieldsDefaultColumnsConfigQuery',
        options: ({ contentType }) => {
          return {
            variables: {
              contentType: contentType === 'lead' ? 'customer' : contentType,
            },
          };
        },
      }
    )
  )(ManageColumnsContainer)
);
