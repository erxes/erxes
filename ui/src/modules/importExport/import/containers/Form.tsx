import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations } from '../graphql';
import { queries as tagQueries } from 'modules/tags/graphql';
import { TagsQueryResponse } from 'modules/tags/types';
import { Spinner } from 'erxes-ui';

type Props = {
  contentType: string;
  tagsQuery: TagsQueryResponse;
};

type State = {};

type FinalProps = {
  importHistoriesCreate: any;
} & Props;

class FormContainer extends React.Component<FinalProps, State> {
  render() {
    const { importHistoriesCreate, tagsQuery } = this.props;

    if (tagsQuery.loading) {
      return <Spinner />;
    }

    const addImportHistory = doc => {
      importHistoriesCreate({
        variables: doc
      }).then(response => {
        window.location.href = `/settings/importHistory/${response.data.importHistoriesCreate._id}`;
      });
    };

    const tags = tagsQuery.tags || {};

    return (
      <Form
        contentType={this.props.contentType}
        addImportHistory={addImportHistory}
        tags={tags}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.importHistoriesCreate), {
      name: 'importHistoriesCreate'
    }),
    graphql<Props>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      options: ({ contentType }) => ({
        variables: {
          type: ['lead', 'visitor'].includes(contentType)
            ? 'customer'
            : contentType
        }
      })
    })
  )(FormContainer)
);
