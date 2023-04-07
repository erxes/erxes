import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { Config, IUser, Ticket, Store } from '../../types';
import Form from '../components/Form';
import { AppConsumer } from '../../appContext';
import { queries, mutations } from '../graphql';
import { Alert } from '../../utils';

type Props = {
  config: Config;
  currentUser: IUser;
  closeModal: () => void;
};

function FormContainer({
  config = {},
  currentUser,
  closeModal,
  ...props
}: Props) {
  const [createTicket] = useMutation(gql(mutations.clientPortalCreateTicket), {
    refetchQueries: [{ query: gql(queries.clientPortalTickets) }]
  });

  const { data: customFields } = useQuery(gql(queries.fields), {
    variables: {
      contentType: 'cards:ticket',
      pipelineId: config?.ticketPipelineId,
      isVisibleToCreate: true
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  const { data: departments } = useQuery(gql(queries.departments), {
    variables: {
      withoutUserFilter: true
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  const { data: branches } = useQuery(gql(queries.branches), {
    variables: {
      withoutUserFilter: true
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  const { data: products } = useQuery(gql(queries.products), {
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  const handleSubmit = (doc: Ticket) => {
    createTicket({
      variables: {
        ...doc,
        type: 'ticket',
        stageId: config.ticketStageId,
        email: currentUser.email,
        priority: 'Critical' // TODO: Add select in Form
      }
    }).then(() => {
      Alert.success("You've successfully created a ticket");

      closeModal();
    });
  };

  const updatedProps = {
    ...props,
    customFields: customFields?.fields || [],
    departments: departments?.departments || [],
    branches: branches?.branches || [],
    products: products?.products || [],
    handleSubmit
  };

  return <Form {...updatedProps} />;
}

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <FormContainer {...props} config={config} currentUser={currentUser} />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
