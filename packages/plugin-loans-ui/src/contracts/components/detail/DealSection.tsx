import React from 'react';
import { IContract } from '../../types';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-cards/src/deals/graphql';
import Items from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/deals/options';
import { useQuery } from '@apollo/client';

interface Props {
  contract: IContract;
}

function DealSection(props: Props) {
  const dealsData = useQuery(gql(queries.deals), {
    variables: { _ids: [props.contract.dealId] },
  });

  const onChange: any = () => {
    console.log('onChange');
  };

  return (
    <Items
      items={dealsData?.data?.deals || []}
      data={{ options: options }}
      onChangeItem={onChange}
      hideQuickButtons
    />
  );
}

export default DealSection;
