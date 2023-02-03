import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/StoryForm';
import { mutations, queries } from '../graphql';

type Props = {
  _id: String;
};

type FinalProps = {
  detailQuery?;
  companiesQuery: any;
  saveMutation;
  history;
} & Props;
class Container extends React.Component<FinalProps> {
  render() {
    const {
      _id,
      detailQuery,
      companiesQuery,
      saveMutation,
      history
    } = this.props;

    if (detailQuery && detailQuery.loading) {
      return null;
    }

    const save = (doc: any) => {
      saveMutation({
        variables: { _id, ...doc }
      })
        .then(() => {
          history.push('/settings/apexstories');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      companies: companiesQuery.companies || [],
      obj: detailQuery ? detailQuery.apexStoryDetail || {} : {},
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.storiesDetail), {
      name: 'detailQuery',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: {
          _id
        }
      })
    }),

    graphql<Props>(gql(queries.companies), {
      name: 'companiesQuery',
      options: () => ({
        variables: {
          perPage: 1000
        }
      })
    }),

    // mutations
    graphql(gql(mutations.storiesSave), { name: 'saveMutation' })
  )(Container)
);
