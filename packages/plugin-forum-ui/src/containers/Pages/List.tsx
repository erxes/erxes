import React, { FC } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

const PAGES = gql`
  query ForumPages($sort: JSON) {
    forumPages(sort: $sort) {
      _id
      code
      content
      custom
      customIndexed
      description
      listOrder
      thumbnail
      title
    }
  }
`;

const PagesList: FC = () => {
  const { data, loading, error } = useQuery(PAGES, {
    fetchPolicy: 'network-only',
    variables: {
      sort: {
        code: 1,
        listOrder: 1
      }
    }
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <div>
        <Link to="/forums/pages/new">New Page</Link>
      </div>
      <h1>Pages List</h1>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Thumbnail</th>
            <th>List order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.forumPages.map((page: any) => (
            <tr key={page._id}>
              <td>{page.code}</td>
              <td>{page.title}</td>
              <td>
                {page.thumbnail && <img src={page.thumbnail} alt="thumbnail" />}
              </td>
              <td>{page.listOrder}</td>
              <td>
                <Link to={`/forums/pages/${page._id}`}>Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PagesList;
