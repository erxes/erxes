import React from 'react';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import Form from '../components/Form';

const CATEGORY = gql`
  query ForumCategoryDetail($id: ID!) {
    forumCategory(_id: $id) {
      _id
      code
      name
      parentId
      thumbnail
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation ForumPatchCategory(
    $id: ID!
    $code: String
    $name: String
    $parentId: String
    $thumbnail: String
  ) {
    forumPatchCategory(
      _id: $id
      code: $code
      name: $name
      parentId: $parentId
      thumbnail: $thumbnail
    ) {
      _id
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation ForumCreateCategory(
    $name: String!
    $parentId: String
    $code: String
    $thumbnail: String
  ) {
    forumCreateCategory(
      name: $name
      parentId: $parentId
      code: $code
      thumbnail: $thumbnail
    ) {
      _id
    }
  }
`;

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { data, loading, error } = useQuery(CATEGORY, {
    variables: { id: categoryId }
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    // onCompleted: () => alert('updated'),
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: ['ForumCategoriesByParentIds', 'ForumCategoryDetail']
  });

  const [addSubCategory] = useMutation(CREATE_CATEGORY, {
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: ['ForumCategoriesByParentIds']
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const { forumCategory } = data;

  const onSubmitUpdate = v => {
    updateCategory({
      variables: {
        ...v,
        id: forumCategory._id
      }
    });
  };

  const onAddSubCategory = v => {
    addSubCategory({
      variables: {
        ...v,
        parentId: forumCategory._id
      }
    });
  };

  return (
    <div>
      <pre>{JSON.stringify(data.forumCategory, null, 2)}</pre>
      <h2>Edit</h2>
      <Form
        key={data.forumCategory._id}
        category={data.forumCategory}
        onSubmit={onSubmitUpdate}
      />

      <h2>Add subcategory</h2>
      <Form
        key={'addsub' + data.forumCategory._id}
        onSubmit={onAddSubCategory}
        noParent
      />
    </div>
  );
}
