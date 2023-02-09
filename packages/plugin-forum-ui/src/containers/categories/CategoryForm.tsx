import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import CategoryFormComponent from '../../components/categories/CategoryForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICategory } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

type Props = {
  category?: ICategory;
  closeModal: () => void;
} & IRouterProps;

function CategoryFormContainer({ closeModal, category }: Props) {
  const { data, loading, error } = useQuery(
    gql(queries.categoryPossibleParents),
    {
      variables: {
        _id: category ? category._id : null
      }
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object._id ? mutations.updateCategory : mutations.createCategory
        }
        variables={values}
        callback={callback}
        refetchQueries={[
          {
            query: gql(queries.categoriesByParentIds),
            variables: { parentId: [values.parentId ? values.parentId : null] }
          }
        ]}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object._id ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  return (
    <CategoryFormComponent
      category={category}
      categories={data.forumCategoryPossibleParents}
      renderButton={renderButton}
      closeModal={closeModal}
    />
  );
}

export default CategoryFormContainer;
