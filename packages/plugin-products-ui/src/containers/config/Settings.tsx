import { gql } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { ProductsConfigsQueryResponse, IConfigsMap } from '../../types';
import { UomsQueryResponse } from '@erxes/ui-products/src/types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  component: any;
};

const SettingsContainer: React.FC<Props> = (props) => {
  const productsConfigsQuery = useQuery<ProductsConfigsQueryResponse>(
    gql(queries.productsConfigs),
  );
  const uomsQuery = useQuery<UomsQueryResponse>(gql(queries.uoms));
  const [updateConfigs] = useMutation(gql(mutations.productsConfigsUpdate));

  // create or update action
  const save = (map: IConfigsMap) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        productsConfigsQuery.refetch();
        Alert.success('You successfully updated settings');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const configs =
    (productsConfigsQuery.data && productsConfigsQuery.data.productsConfigs) ||
    [];

  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const Component = props.component;
  return (
    <Component
      {...props}
      configsMap={configsMap}
      save={save}
      uoms={uomsQuery.data && uomsQuery.data.uoms}
      loading={productsConfigsQuery.loading || uomsQuery.loading}
    />
  );
};

export default SettingsContainer;
