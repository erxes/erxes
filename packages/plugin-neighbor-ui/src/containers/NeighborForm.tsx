import React from 'react';
import NeighborForm from '../components/NeigborForm';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import queries from '../graphql/queries';
import mutations from '../graphql/mutations';

function NeighborFormContainer({ productCategory }) {
  const detailQuery = useQuery(gql(queries.getNeighbor), {
    variables: { productCategoryId: productCategory._id }
  });
  const [saveMutation] = useMutation(gql(mutations.neighborSave));

  if (detailQuery.loading) {
    return <div>...</div>;
  }

  if (detailQuery.error) {
    return <div>{detailQuery.error.message}</div>;
  }

  const save = (data: any, rate: object) => {
    saveMutation({
      variables: { productCategoryId: productCategory._id, data, rate }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <NeighborForm
      productCategoryName={productCategory.name}
      save={save}
      neighbor={detailQuery.data.getNeighbor}
    />
  );
}

export default NeighborFormContainer;
