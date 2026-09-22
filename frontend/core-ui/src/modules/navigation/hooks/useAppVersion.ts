import { useQuery } from '@apollo/client';
import { GET_ENV_CONFIG } from '@/navigation/graphql/queries/getEnvConfig';

const DEFAULT_VERSION = '3.0.0-beta.1';

interface EnvConfigResponse {
  configsGetEnv: {
    RELEASE: string | null;
  } | null;
}

export function useAppVersion(): string {
  const { data } = useQuery<EnvConfigResponse>(GET_ENV_CONFIG);

  return data?.configsGetEnv?.RELEASE || DEFAULT_VERSION;
}
