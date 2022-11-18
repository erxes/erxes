import React, { FC } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PageForm from '../../components/PageForm';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo';
import { PAGE_REFETCH } from '../../graphql/queries';
import { PAGE_DETAIL } from '../../graphql/queries';

const UPDATE = gql`
  mutation ForumPatchPage(
    $id: ID!
    $code: String
    $content: String
    $custom: JSON
    $customIndexed: JSON
    $description: String
    $listOrder: Float
    $thumbnail: String
    $title: String
  ) {
    forumPatchPage(
      _id: $id
      code: $code
      content: $content
      custom: $custom
      customIndexed: $customIndexed
      description: $description
      listOrder: $listOrder
      thumbnail: $thumbnail
      title: $title
    ) {
      _id
    }
  }
`;

const EditPage: FC = () => {
  const { id } = useParams();
  const history = useHistory();
  const [mutUpdate] = useMutation(UPDATE, {
    refetchQueries: PAGE_REFETCH
  });

  const { data, loading, error } = useQuery(PAGE_DETAIL, {
    fetchPolicy: 'network-only',
    variables: {
      id
    }
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const { forumPage } = data;

  const onSubmit = async variables => {
    await mutUpdate({
      variables: {
        id,
        ...variables
      }
    });
    history.push(`/forums/pages/${id}`);
  };

  return (
    <div>
      <h1>Edit Page</h1>

      <PageForm onSubmit={onSubmit} page={forumPage} />
    </div>
  );
};

export default EditPage;
