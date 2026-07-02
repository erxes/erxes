import { gql, useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const POS_ORDER_ERKHET_CONFIG_CODE = 'posOrderErkhetConfig';

const MN_CONFIGS = gql`
  query PosOrderErkhetConfigs($code: String!) {
    mnConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

const POS_LIST = gql`
  query PosOrderErkhetPosList {
    posList {
      _id
      name
      token
      beginNumber
      paymentTypes
    }
  }
`;

const CREATE_CONFIG = gql`
  mutation PosOrderErkhetConfigCreate(
    $code: String!
    $subId: String
    $value: JSON
  ) {
    mnConfigsCreate(code: $code, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

const UPDATE_CONFIG = gql`
  mutation PosOrderErkhetConfigUpdate(
    $id: String!
    $subId: String
    $value: JSON
  ) {
    mnConfigsUpdate(_id: $id, subId: $subId, value: $value) {
      _id
      code
      subId
      value
    }
  }
`;

const REMOVE_CONFIG = gql`
  mutation PosOrderErkhetConfigRemove($id: String!) {
    mnConfigsRemove(_id: $id)
  }
`;

export type TPosOrderErkhetConfig = {
  _id?: string;
  subId?: string;
  title: string;
  posId: string;
  userEmail: string;
  beginNumber?: string;
  hasVat: boolean;
  hasCitytax: boolean;
  reverseVatRules?: string | string[];
  reverseCtaxRules?: string | string[];
  defaultPay: string;
  [key: string]: any;
};

export type TPos = {
  _id: string;
  name: string;
  token: string;
  beginNumber?: string;
  paymentTypes?: { type: string; title?: string }[];
};

const parseConfigValue = (value: any) =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

const toArrayValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toFormValue = (value?: string | string[]) =>
  Array.isArray(value) ? value.join(',') : value || '';

const readConfig = (config: any): TPosOrderErkhetConfig => {
  const value = parseConfigValue(config.value);

  return {
    _id: config._id,
    subId: config.subId,
    ...value,
    reverseVatRules: toFormValue(value.reverseVatRules),
    reverseCtaxRules: toFormValue(value.reverseCtaxRules),
  };
};

const writeConfig = (data: TPosOrderErkhetConfig) => {
  const { _id, subId, reverseVatRules, reverseCtaxRules, ...value } = data;

  return {
    ...value,
    isSyncErkhet: true,
    reverseVatRules: toArrayValue(reverseVatRules),
    reverseCtaxRules: toArrayValue(reverseCtaxRules),
  };
};

export const usePosOrderErkhetConfigs = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const { data, loading, refetch } = useQuery(MN_CONFIGS, {
    variables: { code: POS_ORDER_ERKHET_CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const { data: posData, loading: posLoading } = useQuery(POS_LIST, {
    fetchPolicy: 'cache-and-network',
  });

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_CONFIG,
    {
      onError: (e) =>
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        }),
    },
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_CONFIG,
    {
      onError: (e) =>
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        }),
    },
  );
  const [removeConfig, { loading: removeLoading }] = useMutation(
    REMOVE_CONFIG,
    {
      onError: (e) =>
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        }),
    },
  );

  const configs = (data?.mnConfigs || []).map(readConfig);
  const poss: TPos[] = posData?.posList || [];

  const saveConfig = async (data: TPosOrderErkhetConfig) => {
    const value = writeConfig(data);

    if (data._id) {
      await updateConfig({
        variables: { id: data._id, subId: value.posId, value },
      });
      toast({ title: t('success'), description: t('config-updated-successfully') });
    } else {
      await createConfig({
        variables: {
          code: POS_ORDER_ERKHET_CONFIG_CODE,
          subId: value.posId,
          value,
        },
      });
      toast({ title: t('success'), description: t('config-created-successfully') });
    }

    await refetch();
  };

  const deleteConfig = async (id: string) => {
    await removeConfig({ variables: { id } });
    await refetch();
    toast({ title: t('success'), description: t('config-deleted-successfully') });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
    await refetch();
    toast({ title: t('success'), description: t('configs-deleted', { count: ids.length }) });
  };

  return {
    configs,
    poss,
    loading: loading || posLoading,
    saveLoading: createLoading || updateLoading || removeLoading,
    saveConfig,
    deleteConfig,
    deleteManyConfigs,
  };
};
