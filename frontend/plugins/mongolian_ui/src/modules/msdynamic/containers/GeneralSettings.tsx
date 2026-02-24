import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

import List from '../components/settings/GeneralSettings';
import { mutations, queries } from '../graphql';

type Props = {};

const GeneralSettingsContainer = (_props: Props) => {
  const { data, loading, refetch } = useQuery(gql(queries.configs), {
    variables: { code: 'DYNAMIC' },
    fetchPolicy: 'network-only'
  });

  const [updateConfigs] = useMutation(gql(mutations.updateConfigs));

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const config = data?.configsGetValue || [];

  const configsMap = config?.code
    ? { [config.code]: config.value }
    : {};

  const save = async (map: Record<string, any>) => {
    try {
      await updateConfigs({
        variables: { configsMap: map }
      });

      await refetch();

      console.log(
        'You successfully updated stage in sync msdynamic settings'
      );
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <List
      configsMap={configsMap}
      save={save}
    />
  );
};

export default GeneralSettingsContainer;