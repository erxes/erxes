import { getConfigs } from '@/organization/settings/utils/configs';
import { IModels } from '~/connectionResolvers';

/**
 * The organization's physical postal address.
 *
 * Commercial email has to carry one — CAN-SPAM requires it, and its absence is
 * a spam signal on its own. It is also what SendGrid asks for on every sender
 * it verifies, so both uses read the same three values rather than asking an
 * admin to type an address once per sender.
 */
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

/** Empty when nothing is configured, so callers can leave the footer out. */
export const formatPostalAddress = ({
  address,
  city,
  country,
}: IPostalAddress) => [address, city, country].filter(Boolean).join(', ');
