
import { Alert } from '@erxes/ui/src/utils';
import { mutations, queries } from '../../graphql';
import { useQuery, gql, useMutation } from '@apollo/client'
import ConfigForm from '../components/ConfigForm';
import React from 'react';
import { IConfigsMaps } from '../../../../plugin-burenscoring-ui/src/types';

type Props = {
  component: any;
  configCode: string;
};
function ConfigContainer(props: Props) {

  const configsQuery = useQuery(queries.configs, {
    variables: { code: props.configCode} 
  })

  // const configsQuery = useQuery<{
  //   configs: [{
  //     _id: string,
  //     code: string,
  //     value: string
  //   }]
  // }>(gql(queries.configs));
  const [updateConfigs] = useMutation(gql(mutations.updateConfigs))
  // create or update action
  const save = (map: IConfigsMaps) => {
    updateConfigs({
      variables: { configsMap: map },
    })
      .then(() => {
        configsQuery.refetch();
        Alert.success(
          'You successfully updated golomt bank config',
        );
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const configs = configsQuery.data?.configs || [];

  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const updatedProps = {
    ...props,
    configsMap,
    save,
    loading: configsQuery.loading,
  };
  return <ConfigForm {...updatedProps} />
}
export default ConfigContainer

