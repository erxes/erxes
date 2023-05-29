import * as compose from 'lodash.flowright';

import { COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES } from '@erxes/ui-settings/src/constants';
import { IAttachment } from 'modules/common/types';
import MapColumn from '../components/MapColumn';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { queries as commonQueries } from '../../common/graphql';
import { withProps } from 'modules/common/utils';

type Props = {
  contentType: string;
  attachments: IAttachment[];
  columnWithChosenField: any;
  serviceType?: string;
  onChangeColumn: (column, value, contentType) => void;
};

type State = {};

type FinalProps = {
  fieldsQuery: any; // check - FieldsCombinedByTypeQueryResponse
  importHistoryGetColumns: any;
} & Props;

class MapColumnContainer extends React.Component<FinalProps, State> {
  render() {
    const {
      fieldsQuery,
      importHistoryGetColumns,
      onChangeColumn,
      columnWithChosenField,
      contentType
    } = this.props;

    if (!fieldsQuery || fieldsQuery.loading) {
      return <Spinner />;
    }

    if (
      !importHistoryGetColumns ||
      (importHistoryGetColumns && importHistoryGetColumns.loading)
    ) {
      return <Spinner />;
    }

    const fields = [
      ...(fieldsQuery.fieldsCombinedByContentType || []).map(item => {
        return {
          value: item.name || item._id || item.value,
          label: item.label || item.title,
          type: (item.type || '').toLowerCase()
        };
      })
    ];

    const columns = importHistoryGetColumns.importHistoryGetColumns;

    return (
      <MapColumn
        contentType={contentType}
        fields={fields}
        columns={columns}
        columnWithChosenField={columnWithChosenField}
        onChangeColumn={onChangeColumn}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(commonQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ contentType }) => {
        return {
          variables: {
            contentType,
            usageType: 'import',
            excludedNames: COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES.IMPORT
          }
        };
      }
    }),
    graphql<Props>(gql(queries.importHistoryGetColumns), {
      name: 'importHistoryGetColumns',
      skip: ({ attachments }) => attachments.length === 0,
      options: ({ attachments }) => {
        return {
          variables: {
            attachmentName: attachments[0].url
          }
        };
      }
    })
  )(MapColumnContainer)
);
