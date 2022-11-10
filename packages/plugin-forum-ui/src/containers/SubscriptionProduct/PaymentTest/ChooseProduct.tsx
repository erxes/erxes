import React, { FC } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_SUBSCRIPTION_PRODUCTS_QUERY } from '../../../graphql/queries';

type Props = {
  value: string;
  onChange: (productId: string) => void;
};

const ChooseProduct: FC<Props> = ({ value, onChange }) => {
  const { loading, error, data } = useQuery(FORUM_SUBSCRIPTION_PRODUCTS_QUERY, {
    variables: {
      sort: { listOrder: -1 }
    },
    fetchPolicy: 'network-only'
  });

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option key="" value=""></option>
      {data?.forumSubscriptionProducts.map((sp: any) => (
        <option key={sp._id} value={sp._id}>
          {sp.name} ({sp.multiplier} {sp.unit})
        </option>
      ))}
    </select>
  );
};

export default ChooseProduct;
