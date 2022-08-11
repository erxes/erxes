import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import Form from '../components/Form';
import { allCategoryQueries, CATEGORY_DETAIL } from '../graphql/queries';
import { UPDATE_CATEGORY, CREATE_CATEGORY } from '../graphql/mutations';

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { data, loading, error } = useQuery(CATEGORY_DETAIL, {
    variables: { id: categoryId }
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    // onCompleted: () => alert('updated'),
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: allCategoryQueries
  });

  const [addSubCategory] = useMutation(CREATE_CATEGORY, {
    onError: e => {
      console.error(e);
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: allCategoryQueries
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
