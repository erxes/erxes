import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
      <h1>Category info</h1>
      <table>
        <tbody>
          <tr>
            <td>Code:</td>
            <p>{forumCategory.code || 'N/A'}</p>
          </tr>

          {forumCategory.parentId && (
            <tr>
              <td>Parent</td>
              <td>
                <Link to={`/forums/categories/${forumCategory.parentId}`}>
                  {forumCategory.parent.name}
                </Link>
              </td>
            </tr>
          )}

          <tr>
            <td>Name:</td>
            <p>{forumCategory.name}</p>
          </tr>
          <tr>
            <td>Thumbnail:</td>
            <td>
              <img src={forumCategory.thumbnail} />
            </td>
          </tr>
          <tr>
            <td>Description:</td>
            <td
              style={{
                whiteSpace: 'pre-wrap'
              }}
            >
              {forumCategory.description}
            </td>
          </tr>
          <tr>
            <td>Order:</td>
            <td>{forumCategory.order}</td>
          </tr>
        </tbody>
      </table>

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
