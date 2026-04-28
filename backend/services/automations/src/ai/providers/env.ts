import { getEnv } from 'erxes-api-shared/utils';

export const getAiProviderEnv = ({
  name,
  defaultValue = '',
  subdomain,
}: {
  name: string;
  defaultValue?: string;
  subdomain?: string;
}) => {
  return getEnv({ name, defaultValue, subdomain }).trim();
};

export const getFirstAiProviderEnv = ({
  names,
  defaultValue = '',
  subdomain,
}: {
  names: string[];
  defaultValue?: string;
  subdomain?: string;
}) => {
  for (const name of names) {
    const value = getAiProviderEnv({ name, subdomain });

    if (value) {
      return value;
    }
  }

  return defaultValue;
};

