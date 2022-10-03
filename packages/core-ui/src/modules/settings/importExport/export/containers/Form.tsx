import * as compose from 'lodash.flowright';
import { COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES } from '@erxes/ui-settings/src/constants';
import Form from '../components/Form';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import client from 'apolloClient';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { Alert, withProps } from 'modules/common/utils';

type Props = {
  contentType: string;
};

type FinalProps = {
  fieldsQuery: any; //check
  exportHistoriesCreate: (contentType) => Promise<void>;
} & Props;

class FormContainer extends React.Component<
  FinalProps,
  { loading: boolean; count: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: ''
    };
  }

  previewCount = (segmentId?: string) => {
    const { contentType } = this.props;

    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.exportHistoryPreviewExportCount),
        variables: {
          contentType,
          segmentId
        },
        fetchPolicy: 'network-only'
      })
      .then(({ data }) => {
        this.setState({
          count: data.exportHistoryPreviewExportCount,
          loading: false
        });
      });
  };

  render() {
    const { fieldsQuery, exportHistoriesCreate } = this.props;
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
    ) as any[]; //check type - IConfigColumn

    const saveExport = e => {
      console.log(e, 'MAPPPPPPPPPPPPPPPPPPPP');

      exportHistoriesCreate({
        variables: {
          contentType: ''
        }
      })
        .then(() => {
          Alert.success('You successfully exported');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    return (
      <Form
        {...this.props}
        columns={columns}
        count={count}
        loading={loading}
        previewCount={this.previewCount}
        saveExport={saveExport}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsCombinedByContentType), {
      // check this query duplication
      name: 'fieldsQuery',
      options: ({ contentType }) => {
        return {
          variables: {
            contentType,
            usageType: 'export',
            excludedNames: COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES.EXPORT
          }
        };
      }
    }),
    graphql<{}>(gql(mutations.exportHistoriesCreate), {
      name: 'exportHistories'
    })
  )(FormContainer)
);
