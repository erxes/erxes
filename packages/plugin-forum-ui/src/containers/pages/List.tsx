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
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { useQuery } from '@apollo/client';
import { withRouter } from 'react-router-dom';
import { IPage } from '../../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  pagesQuery: PagesQueryResponse;
} & Props &
  RemoveMutationResponse &
  IRouterProps;

function PagesList({
  history,
  removeMutation,
  pagesQuery,
  queryParams
}: FinalProps) {
  const limit = Number(queryParams.perPage || 20);
  const pageIndex = Number(queryParams.page || 1);
  const offset = limit * (pageIndex - 1);

  const { data, loading, error } = useQuery(gql(queries.pages), {
    fetchPolicy: 'network-only',
    variables: {
      sort: { [queryParams.sortField]: queryParams.sortDirection },
      limit,
      offset
    }
  });

  const totalCountQuery = useQuery(gql(queries.pages), {
    fetchPolicy: 'network-only',
    variables: {
      sort: {
        code: 1,
        listOrder: 1
      }
    }
  });

  if (loading || totalCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const remove = (pageId: string, emptyBulk?: () => void) => {
    const deleteFunction = (afterSuccess?: any) => {
      removeMutation({ variables: { _id: pageId } })
        .then(() => {
          pagesQuery.refetch();
          afterSuccess ? afterSuccess() : console.log('success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    if (emptyBulk) {
      deleteFunction(emptyBulk);
    } else {
      confirm('Are you sure?')
        .then(() => deleteFunction(emptyBulk))
        .catch(e => {
          Alert.error(e.message);
        });
    }
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

  const pages = data.forumPages || ([] as IPage[]);
  let filteredPages;

  if (queryParams.search) {
    filteredPages = pages.filter(p => p.title.includes(queryParams.search));
  }

  const totalCount = totalCountQuery.data.forumPages.length || 0;

  const content = props => {
    return (
      <PageList
        {...props}
        queryParams={queryParams}
        renderButton={renderButton}
        totalCount={totalCount}
        pages={queryParams.search ? filteredPages : pages}
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
