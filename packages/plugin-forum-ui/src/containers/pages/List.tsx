import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { PagesQueryResponse, RemoveMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import Bulk from '@erxes/ui/src/components/Bulk';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import PageList from '../../components/pages/PageList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import queryString from 'query-string';
import { useQuery } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type FinalProps = {
  pagesQuery: PagesQueryResponse;
} & RemoveMutationResponse &
  IRouterProps;

function PagesList({ history, removeMutation, pagesQuery }: FinalProps) {
  const { data, loading, error } = useQuery(gql(queries.pages), {
    fetchPolicy: 'network-only',
    variables: {
      sort: {
        code: 1,
        listOrder: 1
      }
    }
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const queryParams = queryString.parse(location.search);

  const remove = pageId => {
    confirm('Are you sure?')
      .then(() =>
        removeMutation({ variables: { _id: pageId } })
          .then(() => {
            pagesQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          })
      )
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editPage : mutations.createPage}
        variables={values}
        callback={callback}
        refetchQueries={queries.pageRefetch}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  const content = props => {
    return (
      <PageList
        {...props}
        queryParams={queryParams}
        renderButton={renderButton}
        pages={data.forumPages}
        history={history}
        remove={remove}
      />
    );
  };
  return <Bulk content={content} />;
}

export default withProps<{}>(
  compose(
    graphql<PagesQueryResponse>(gql(queries.pages), {
      name: 'pagesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.deletePage),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: queries.pageRefetch
        })
      }
    )
  )(withRouter<FinalProps>(PagesList))
);
