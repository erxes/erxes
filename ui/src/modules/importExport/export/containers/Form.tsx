import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';

import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import Form from '../components/Form';
import { COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES } from 'modules/settings/properties/constants';
import {
  FieldsCombinedByTypeQueryResponse,
  IConfigColumn
} from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  contentType: string;
};

type FinalProps = {
  fieldsQuery: FieldsCombinedByTypeQueryResponse;
} & Props;

class FormContainer extends React.Component<
  FinalProps,
  { loading: boolean; count: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: 0
    };
  }

  previewCount = (segmentId?: string) => {
    const { contentType } = this.props;

    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.importHistoryPreviewExportCount),
        variables: {
          contentType,
          segmentId
        },
        fetchPolicy: 'network-only'
      })
      .then(({ data }) => {
        this.setState({
          count: data.importHistoryPreviewExportCount,
          loading: false
        });
      });
  };

  componentWillMount() {
    this.previewCount();
  }

  render() {
    const { fieldsQuery } = this.props;
    const { count, loading } = this.state;

    if (!fieldsQuery || fieldsQuery.loading) {
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
    ) as IConfigColumn[];

    return (
      <Form
        {...this.props}
        columns={columns}
        count={count}
        loading={loading}
        previewCount={this.previewCount}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(formQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ contentType }) => {
        return {
          variables: {
            contentType: ['lead', 'visitor'].includes(contentType)
              ? 'customer'
              : contentType,
            usageType: 'export',
            excludedNames: COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES.IMPORT
          }
        };
      }
    })
  )(FormContainer)
);
