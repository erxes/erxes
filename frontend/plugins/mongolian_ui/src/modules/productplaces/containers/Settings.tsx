import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Spinner } from 'erxes-ui';
import { useQuery, useMutation } from '@apollo/client';

import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IConfigsMap } from '../types';

type Props = {
  component: any;
  configCode: string;
};

const SettingsContainer = (props: Props) => {
  const { component: Component, configCode } = props;

  const configsQuery = useQuery<ConfigsQueryResponse>(
    gql(queries.configs),
    {
      variables: { code: configCode },
      fetchPolicy: 'network-only',
    }
  );

  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  /** 🟢 DRAFT STATE */
  const [draftConfigsMap, setDraftConfigsMap] =
    useState<IConfigsMap>({});

  /** 🔁 Sync server → draft */
  useEffect(() => {
    if (configsQuery.data?.configsGetValue?.value) {
      setDraftConfigsMap(configsQuery.data.configsGetValue.value);
    } else {
      setDraftConfigsMap({});
    }
  }, [configsQuery.data]);

  if (configsQuery.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (configsQuery.error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading configuration: {configsQuery.error.message}
      </div>
    );
  }

  /** Persist to backend ONLY */
  const saveToServer = (map: IConfigsMap) => {
    updateConfigs({
      variables: {
        configsMap: {
          code: configCode,
          value: map,
        },
      },
    })
      .then(() => {
        configsQuery.refetch();
      })
      .catch((error) => {
        console.error('Failed to update configuration:', error.message);
      });
  };

  return (
    <Component
      {...props}
      configsMap={draftConfigsMap}
      save={setDraftConfigsMap}   // 👈 children edit draft
      saveToServer={saveToServer} // 👈 optional explicit save
    />
  );
};

export default SettingsContainer;
