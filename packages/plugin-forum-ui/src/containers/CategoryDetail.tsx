import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import CategoryForm from '../components/CategoryForm';
import { allCategoryQueries, CATEGORY_DETAIL } from '../graphql/queries';
import { UPDATE_CATEGORY, CREATE_CATEGORY } from '../graphql/mutations';
import CategoryDelete from './CategoryDelete';
import { useHistory } from 'react-router-dom';

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { data, loading, error } = useQuery(CATEGORY_DETAIL, {
    variables: { id: categoryId }
  });
  const history = useHistory();

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
      <div
        style={{
          border: '1px solid #e0e0e0',
          padding: 20,
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <h1>Info</h1>
        <div>
          <h3>Code</h3>
          <p>{forumCategory.code || 'N/A'}</p>
        </div>
        <div>
          <h3>Name</h3>
          <p>{forumCategory.name}</p>
        </div>
        <div>
          <h3>Thumbnail</h3>
          <p>
            <img src={forumCategory.thumbnail} />
          </p>
        </div>
      </div>

      <div style={{ border: '1px solid #e0e0e0', padding: 20 }}>
        <h1>Edit</h1>
        <CategoryForm
          key={forumCategory._id}
          category={forumCategory}
          onSubmit={onSubmitUpdate}
        />

        <hr />

        <h1>Add subcategory</h1>
        <CategoryForm
          key={'addsub' + forumCategory._id}
          onSubmit={onAddSubCategory}
          noParent
        />
      </div>

      <h2 style={{ color: 'red' }}>Danger zone</h2>
      <div style={{ border: '1px solid red', padding: 20 }}>
        <h4>Delete</h4>
        <CategoryDelete
          key={'delete' + forumCategory._id}
          _id={forumCategory._id}
          onDelete={() => history.push(`/forums/categories/`)}
        />
      </div>
    </div>
  );
}
