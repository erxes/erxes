import { Config, ICustomField, IUser, LogicParams, Store } from '../../types';
import {
  gql,
  useMutation,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { mutations, queries } from '../graphql';

import { Alert } from '../../utils';
import { AppConsumer } from '../../appContext';
import Form from '../components/Form';
import React, { useEffect, useState } from 'react';
import { capitalize } from '../../common/utils';

type Props = {
  config: Config;
  currentUser: IUser;
  type: string;
  closeModal: () => void;
};

function FormContainer({
  config = {},
  currentUser,
  closeModal,
  type,
  ...props
}: Props) {
  const pipelineId = config[`${type}PipelineId`];

  const fetchPolicy: WatchQueryFetchPolicy = 'network-only';

  const queryConfig = {
    skip: !pipelineId,
    fetchPolicy,
    context: { headers: { 'erxes-app-token': config?.erxesAppToken } },
  };

  const getQuery = (key: keyof typeof queries) => gql(queries[key]);

  const [customFieldsData, setCustomFieldsData] = useState<ICustomField[]>([]);
  const [createItem] = useMutation(gql(mutations.clientPortalCreateCard), {
    refetchQueries: [
      { query: gql(queries[`clientPortal${capitalize(type)}s`]) },
    ],
  });

  const { data: customFields = [] } = useQuery(gql(queries.fields), {
    variables: {
      contentType: `${type}s:${type}`,
      pipelineId: config[`${type}PipelineId`],
      isVisibleToCreate: true,
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken,
      },
    },
  });

  const { loading: loadingLabels, data } = useQuery(
    getQuery(`${type}PipelineLabels` as keyof typeof queries),
    {
      ...queryConfig,
      variables: { pipelineId },
    }
  );

  const { data: departments } = useQuery(gql(queries.departments), {
    variables: {
      withoutUserFilter: true,
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken,
      },
    },
  });

  const { data: branches } = useQuery(gql(queries.branches), {
    variables: {
      withoutUserFilter: true,
    },
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken,
      },
    },
  });

  const { data: products } = useQuery(gql(queries.products), {
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken,
      },
    },
  });

  const handleSubmit = (doc) => {
    createItem({
      variables: {
        ...doc,
        type,
        stageId: config[`${type}StageId`],
        email: currentUser.email,
      },
    }).then(() => {
      Alert.success(`You've successfully created a ${type}`);

      closeModal();
    });
  };



  const labels = data && data[`${type}PipelineLabels`] || [];

  const updatedProps = {
    ...props,
    customFields: customFields.fields || [],
    customFieldsData,
    setCustomFieldsData,
    departments: departments?.departments || [],
    branches: branches?.branches || [],
    products: products?.products || [],
    labels,
    type,
    closeModal,
    handleSubmit,
    currentUser,
    config,
    object: useState({})
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
