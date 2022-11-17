import React, { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { PAGE_DETAIL } from '../../graphql/queries';

const PageDetail: FC = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(PAGE_DETAIL, {
    fetchPolicy: 'network-only',
    variables: {
      id
    }
  });

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
        <button type="button"> Delete</button>
      </div>
    </div>
  );
};

export default PageDetail;
