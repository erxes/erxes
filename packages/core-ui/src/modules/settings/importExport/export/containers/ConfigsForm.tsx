import * as compose from 'lodash.flowright';

import { COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES } from '@erxes/ui-settings/src/constants';
import ConfigsForm from '../components/ConfigsForm';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withProps } from 'modules/common/utils';

type Props = {
  contentType: string;
  onClickField: (columns: any[]) => void;
};

type State = {};

type FinalProps = {
  fieldsQuery: any; //check - FieldsCombinedByTypeQueryResponse
  importHistoryGetColumns: any;
} & Props;

class ConfigsFormContainer extends React.Component<FinalProps, State> {
  render() {
    const { fieldsQuery } = this.props;

    if (!fieldsQuery) {
      return <div>choose content type</div>;
    }

    if (fieldsQuery.loading) {
      return <Spinner />;
    }

    const columns = (fieldsQuery.fieldsCombinedByContentType || []).map(
      field => {
        return {
          ...field,
          _id: Math.random().toString(),
          checked: false,
          order: field.order || 0
        };
      }
    ) as any[];

    return <ConfigsForm {...this.props} columns={columns} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      skip: ({ contentType }) => !contentType,
      options: ({ contentType }) => {
        return {
          variables: {
            contentType,
            usageType: 'export',
            excludedNames: COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES.EXPORT
          }
        };
      }
    })
  )(ConfigsFormContainer)
);
