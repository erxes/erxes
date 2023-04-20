import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import Bulk from '@erxes/ui/src/components/Bulk';
import List from '../../components/quiz/QuizList';
import { IQuiz } from '../../types';

type Props = {
  queryParams: any;
};

const QuizList = ({ queryParams }: Props) => {
  const limit = Number(queryParams.perPage || 20);
  const pageIndex = Number(queryParams.page || 1);
  const offset = limit * (pageIndex - 1);

  const { data, loading, error } = useQuery(gql(queries.quizzesList), {
    fetchPolicy: 'network-only',
    variables: {
      sort: { [queryParams.sortField]: queryParams.sortDirection },
      limit,
      offset
    }
  });

  const totalCountQuery = useQuery(gql(queries.quizzesList), {
    fetchPolicy: 'network-only',
    variables: {
      sort: {
        _id: -1
      }
    }
  });

  const [mutDelete] = useMutation(gql(mutations.deleteQuiz), {
    refetchQueries: ['ForumQuizzes']
  });

  const deleteQuiz = async (id: string, emptyBulk?: () => void) => {
    const deleteFunction = (afterSuccess?: any) => {
      mutDelete({ variables: { id } })
        .then(() => {
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
        .catch(e => Alert.error(e.message));
    }
  };

  if (loading || totalCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const totalCount = totalCountQuery.data.forumQuizzes.length || 0;

  const content = props => {
    return (
      <List
        {...props}
        quizzes={data?.forumQuizzes || ([] as IQuiz)}
        history={history}
        totalCount={totalCount}
        remove={deleteQuiz}
      />
    );
  };
  return <Bulk content={content} />;
};

export default QuizList;
