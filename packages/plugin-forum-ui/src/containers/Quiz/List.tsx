import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo';
import { Link } from 'react-router-dom';

const LIST_QUERY = gql`
  query ForumQuizzes($limit: Int, $offset: Int, $sort: JSON) {
    forumQuizzes(limit: $limit, offset: $offset, sort: $sort) {
      _id
      name
      description
      company {
        _id
        primaryName
      }
      post {
        _id
        title
      }
      category {
        _id
        name
        parent {
          _id
          name
        }
      }
    }
  }
`;

const MUT_DELETE = gql`
  mutation ForumQuizDelete($id: ID!) {
    forumQuizDelete(_id: $id) {
      _id
    }
  }
`;

const QuizList: React.FC<{}> = () => {
  const { data, loading, error } = useQuery(LIST_QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      sort: {
        _id: -1
      }
    }
  });

  const [mutDelete] = useMutation(MUT_DELETE, {
    refetchQueries: ['ForumQuizzes']
  });

  const deleteQuiz = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await mutDelete({ variables: { id } });
    } catch (e) {
      alert(e.message);
    }
  };
  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <Link to="/forums/quizzes/new">Create new quiz</Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Company</th>
            <th>Post</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.forumQuizzes.map((quiz: any) => (
            <tr key={quiz._id}>
              <td>{quiz.name}</td>
              <td>{quiz.description}</td>
              <td>
                {quiz.company?.primaryName ? (
                  <Link to={`/companies/details/${quiz.company._id}`}>
                    {quiz.company?.primaryName}
                  </Link>
                ) : (
                  ''
                )}
              </td>
              <td>
                {quiz.post?.title ? (
                  <Link to={`/forums/posts/${quiz.post._id}`}>
                    {quiz.post?.title}
                  </Link>
                ) : (
                  ''
                )}
              </td>
              <td>
                {quiz.category?.name ? (
                  <Link to={`/forums/categories/${quiz.category._id}`}>
                    {categoryName(quiz.category)}
                  </Link>
                ) : (
                  ''
                )}
              </td>
              <td>
                <Link to={`/forums/quizzes/${quiz._id}`}>Details</Link> |{' '}
                <Link to={`/forums/quizzes/${quiz._id}/edit`}>Edit</Link> |{' '}
                <button type="button" onClick={() => deleteQuiz(quiz._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function categoryName(category) {
  if (!category) return '';
  if (!category.parent) return category.name;
  return `${categoryName(category.parent)} > ${category.name}`;
}

export default QuizList;
