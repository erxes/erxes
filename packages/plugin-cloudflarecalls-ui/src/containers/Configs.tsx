import { gql, useQuery } from '@apollo/client';
import { queries } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

export default function Configs() {
  const { data, loading, error } = useQuery(gql(queries.callsGetConfigs));

  if (loading) {
    return null;
  }
  if (error) {
    return Alert.error(error.message);
  }

  const configs = data.cloudflareCallsGetConfigs;
  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }
  if (!configsMap) {
    return null;
  }
  return {
    callsAppId: configsMap['APP_ID'],
    callsAppSecret: configsMap['APP_SECRET'],
  };
}
