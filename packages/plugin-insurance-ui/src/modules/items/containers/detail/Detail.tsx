import { useQuery, useMutation } from '@apollo/client';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import Component from '../../components/detail/Detail';
import queries from '../../graphql';

type Props = {
  dealId: string;
};

const Detail = (props: Props) => {
  console.log("detail container")
  const { data, loading } = useQuery(queries.detailQuery, {
    variables: { id: props.dealId },
  });

  const [updateMutation] = useMutation(queries.editMutation);

  if (loading) {
    return <Spinner />;
  }

  if (!data || !data.insuranceItemByDealId) {
    return <EmptyState text="Item not found" />;
  }

  const onUpdate = (data: any) => {
    updateMutation({
      variables: { _id: props.dealId, doc: data },
    });
  }

  const item = data.insuranceItemByDealId;

  return <Component item={item} onUpdate={onUpdate} />;
};

export default Detail;
