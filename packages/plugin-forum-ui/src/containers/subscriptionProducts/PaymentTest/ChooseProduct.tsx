import React, { FC } from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../../../graphql';
import gql from 'graphql-tag';

type Props = {
  value: string;
  onChange: (productId: string) => void;
};

const ChooseProduct: FC<Props> = ({ value, onChange }) => {
  const { loading, error, data } = useQuery(
    gql(queries.forumSubscriptionProductsQuery),
    {
      variables: {
        sort: { listOrder: -1 }
      },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option key="" value="" />
      {data?.forumSubscriptionProducts.map((sp: any) => (
        <option key={sp._id} value={sp._id}>
          {sp.name} ({sp.multiplier} {sp.unit})
        </option>
      ))}
    </select>
  );
};

export default ChooseProduct;
