import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import PageList from '../../components/pages/PageList';
import queryString from 'query-string';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { queries, mutations } from '../../graphql';
import { Alert, withProps, confirm } from '@erxes/ui/src/utils';
import { RemoveMutationResponse, PagesQueryResponse } from '../../types';
import { graphql } from 'react-apollo';
import Spinner from '@erxes/ui/src/components/Spinner';

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
        refetchQueries={getRefetchQueries()}
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

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.pages)
    }
  ];
};

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
