import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules/states';
import { EBARIMT_GET_COMPANY } from '../graphql/queries/getCompanyByRegister';

const MONGOLIAN_PLUGIN = 'mongolian';

const TIN_PATTERN = /^(\d{11}|\d{12}|\d{14})$/;
const REGISTER_PATTERN = /^([А-ЯЁӨҮ]{2}\d{8}|\d{7})$/iu;

export const isLookupableRegister = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return TIN_PATTERN.test(trimmed) || REGISTER_PATTERN.test(trimmed);
};

type EbarimtCompanyInfo = {
  status?: string;
  tin?: string;
  result?: { data?: { name?: string } };
};

export const useCompanyNameByRegister = (register?: string) => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const hasMongolianPlugin = Object.values(pluginsConfig || {}).some(
    (plugin) => plugin?.name === MONGOLIAN_PLUGIN,
  );
  const enabled = hasMongolianPlugin && isLookupableRegister(register);

  const { data, loading } = useQuery<{
    ebarimtGetCompany: EbarimtCompanyInfo | null;
  }>(EBARIMT_GET_COMPANY, {
    variables: { companyRD: register?.trim() },
    skip: !enabled,
    errorPolicy: 'ignore',
  });

  const info = data?.ebarimtGetCompany;

  return {
    companyName:
      info?.status === 'checked' ? info.result?.data?.name : undefined,
    loading: enabled && loading,
  };
};
