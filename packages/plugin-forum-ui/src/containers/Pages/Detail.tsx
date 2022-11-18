import React, { FC } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { PAGE_DETAIL, PAGE_REFETCH } from '../../graphql/queries';

const DELETE = gql`
  mutation ForumDeletePage($id: ID!) {
    forumDeletePage(_id: $id) {
      _id
    }
  }
`;

const PageDetail: FC = () => {
  const history = useHistory();
  const { id } = useParams();
  const { data, loading, error } = useQuery(PAGE_DETAIL, {
    fetchPolicy: 'network-only',
    variables: {
      id
    }
  });

  const [mutDelete] = useMutation(DELETE, {
    variables: { id },
    refetchQueries: PAGE_REFETCH
  });

  const onDelete = async () => {
    await mutDelete();
    history.replace('/forums/pages');
  };

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;
  const { forumPage } = data;

  return (
    <div>
      <h1> Page details</h1>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Thumbnail</th>
            <th>List order</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{forumPage.code}</td>
            <td>{forumPage.title}</td>
            <td>
              {forumPage.thumbnail && (
                <img src={forumPage.thumbnail} alt="thumbnail" />
              )}
            </td>
            <td>{forumPage.listOrder}</td>
          </tr>
        </tbody>
      </table>
      <h3>Content:</h3>
      <div dangerouslySetInnerHTML={{ __html: forumPage.content }} />

      <h3>Description: </h3>
      <div style={{ whiteSpace: 'pre-wrap' }}>{forumPage.description}</div>

      <h1>Actions</h1>

      <div>
        <Link to={`/forums/pages/${forumPage._id}/edit`}>Edit</Link>
        <br />
        <button type="button" onClick={onDelete}>
          {' '}
          Delete
        </button>
      </div>
    </div>
  );
};

export default PageDetail;
