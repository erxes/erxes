import { getConfigs } from '@/organization/settings/utils/configs';
import { IModels } from '~/connectionResolvers';

export interface IPostalAddress {
  address: string;
  city: string;
  country: string;
}

export const getPostalAddress = async (
  models: IModels,
): Promise<IPostalAddress> => {
  const configs = (await getConfigs(models)) as Record<string, string>;

  return {
    address: configs.COMPANY_POSTAL_ADDRESS || '',
    city: configs.COMPANY_POSTAL_CITY || '',
    country: configs.COMPANY_POSTAL_COUNTRY || '',
  };
};

export const formatPostalAddress = ({
  address,
  city,
  country,
}: IPostalAddress) => [address, city, country].filter(Boolean).join(', ');
