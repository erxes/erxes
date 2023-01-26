import React, { FC } from 'react';
import PageForm from '../../components/PageForm';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

import { useHistory } from 'react-router-dom';
import { queries } from '../../graphql';

const CREATE = gql`
  mutation ForumCreatePage(
    $code: String
    $content: String
    $custom: JSON
    $customIndexed: JSON
    $description: String
    $listOrder: Float
    $thumbnail: String
    $title: String
  ) {
    forumCreatePage(
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

const NewPage: FC = () => {
  const history = useHistory();
  const [mutCreate] = useMutation(CREATE, {
    refetchQueries: queries.pageRefetch
  });

  const onSubmit = async variables => {
    const result = await mutCreate({
      variables
    });

    history.push(`/forums/pages/${result.data.forumCreatePage._id}`);
  };

  return (
    <div>
      <h1>New Page</h1>

      <PageForm onSubmit={onSubmit} />
    </div>
  );
};

export default NewPage;
