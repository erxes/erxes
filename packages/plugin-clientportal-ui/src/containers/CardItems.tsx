import React from 'react';
import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';
import { gql } from '@apollo/client';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import ticketOptions from '@erxes/ui-cards/src/tickets/options';
import dealOptions from '@erxes/ui-cards/src/deals/options';
import taskOptions from '@erxes/ui-cards/src/tasks/options';
import purchaseOptions from '@erxes/ui-cards/src/purchases/options';

type Props = {
  userId: string;
  type: string;
};

const CardItems = (props: Props) => {
  const [items, setItems] = React.useState<any[]>([]);

  const ticketsQry = useQuery<any>(gql(queries.ticketsOfUser), {
    variables: { userId: props.userId, type: props.type },
    skip: props.type !== 'ticket'
  });

  const dealsQry = useQuery<any>(gql(queries.dealsOfUser), {
    variables: { userId: props.userId, type: props.type },
    skip: props.type !== 'deal'
  });

  const tasksQry = useQuery<any>(gql(queries.tasksOfUser), {
    variables: { userId: props.userId, type: props.type },
    skip: props.type !== 'task'
  });

  const purchasesQry = useQuery<any>(gql(queries.purchasesOfUser), {
    variables: { userId: props.userId, type: props.type },
    skip: props.type !== 'purchase'
  });

  React.useEffect(() => {
    if (props.type === 'ticket' && ticketsQry.data) {
      setItems(ticketsQry.data.clientPortalUserTickets);
    } else if (props.type === 'deal' && dealsQry.data) {
      setItems(dealsQry.data.clientPortalUserDeals);
    } else if (props.type === 'task' && tasksQry.data) {
      setItems(tasksQry.data.clientPortalUserTasks);
    } else if (props.type === 'purchase' && purchasesQry.data) {
      setItems(purchasesQry.data.clientPortalUserPurchases);
    }
  }, [ticketsQry.data, dealsQry.data, tasksQry.data, purchasesQry.data]);

  const options: any = React.useMemo(() => {
    if (props.type === 'ticket') {
      return ticketOptions;
    } else if (props.type === 'deal') {
      return dealOptions;
    } else if (props.type === 'task') {
      return taskOptions;
    } else if (props.type === 'purchase') {
      return purchaseOptions;
    }
  }, [props.type]);

  return (
    <PortableItems
      data={{
        options: { ...options, title: `${props.type}s`, type: props.type }
      }}
      hideQuickButtons={true}
      items={items || []}
      onChangeItem={() => {
        console.log('onChangeItem');
      }}
    />
  );
};

export default CardItems;
