import React from 'react';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { mutations } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import ContentType from '../../components/contentTypes/ContenType';
import { IRouterProps } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';

type Props = {
  typesAddMutation: any;
} & IRouterProps;

function CreateContentTypeContainer(props: Props) {
  const { typesAddMutation, history } = props;

  const action = (doc: any) => {
    typesAddMutation({ variables: doc })
      .then(() => {
        Alert.success('Content type added');

        history.push({
          pathname: '/webbuilder/contenttypes'
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    action
  };

  return <ContentType {...updatedProps} />;
}

export default compose(
  graphql(gql(mutations.typesAdd), {
    name: 'typesAddMutation'
  })
)(withRouter(CreateContentTypeContainer));
