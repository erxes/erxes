import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import * as compose from 'lodash.flowright';
import { mutations, queries } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import ContentType from '../../components/contentTypes/ContenType';

type Props = {
  contentTypeId: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  contentTypesEditMutation: any;
  contentTypeDetailQuery: any;
} & Props;

function EditContentTypeContainer(props: FinalProps) {
  const { contentTypesEditMutation, contentTypeDetailQuery, history } = props;

  if (contentTypeDetailQuery.loading) {
    return null;
  }

  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};

  const action = (doc: any) => {
    contentTypesEditMutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully edited a type');

        history.push({
          pathname: '/webbuilder/contenttypes'
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    action,
    contentType
  };

  return <ContentType {...updatedProps} />;
}

export default compose(
  graphql(gql(mutations.typesEdit), {
    name: 'contentTypesEditMutation'
  }),
  graphql<FinalProps>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId
      }
    })
  })
)(withRouter(EditContentTypeContainer));
