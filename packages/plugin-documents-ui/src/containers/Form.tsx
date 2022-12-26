import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  _id: String;
};

type FinalProps = {
  detailQuery?;
  saveMutation;
  history;
} & Props;
class Container extends React.Component<FinalProps> {
  render() {
    const { _id, detailQuery, saveMutation, history } = this.props;

    if (detailQuery && detailQuery.loading) {
      return null;
    }

    const save = (doc: any) => {
      saveMutation({
        variables: { _id, contentType: 'cards', ...doc }
      })
        .then(() => {
          history.push('/settings/documents');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      obj: detailQuery ? detailQuery.documentsDetail || {} : {},
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.documentsDetail), {
      name: 'detailQuery',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: {
          _id
        }
      })
    }),

    // mutations
    graphql(gql(mutations.documentsSave), { name: 'saveMutation' })
  )(Container)
);
