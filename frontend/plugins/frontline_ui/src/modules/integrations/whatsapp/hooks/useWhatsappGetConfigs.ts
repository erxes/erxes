import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_WHATSAPP_CONFIGS } from '../graphql/queries/whatsappConfigQueries';

interface IWhatsappConfig {
  _id: string;
  code: string;
  value: string;
}

export const useWhatsappGetConfigs = () => {
  const { data, loading } = useQuery<{
    whatsappGetConfigs: IWhatsappConfig[];
  }>(GET_WHATSAPP_CONFIGS);

  const whatsappConfigs = useMemo(() => {
    const configs: Record<string, string> = {};

    for (const config of data?.whatsappGetConfigs || []) {
      configs[config.code] = String(config.value || '');
    }

    return configs;
  }, [data?.whatsappGetConfigs]);

  return { loading, whatsappConfigs };
};
