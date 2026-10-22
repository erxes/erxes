import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { compactList } from '@/shared/utils/cursorList';
import { jsonRecords } from '@/shared/utils/json';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  REMOVE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';
import { GET_POS_LIST } from '@/shared/graphql/posList';

export const POS_ORDER_ERKHET_CONFIG_CODE = 'posOrderErkhetConfig';

export type TPosOrderErkhetConfig = {
  _id?: string;
  subId?: string;
  title: string;
  posId: string;
  userEmail: string;
  beginNumber?: string;
  hasVat: boolean;
  hasCitytax: boolean;
  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
  useRemainder?: boolean;
  accounts?: string;
  locations?: string;
  account?: string;
  location?: string;
  defaultPay: string;
  cashAmount?: string;
  mobileAmount?: string;
  [key: string]: any;
};

export type TPos = {
  _id: string;
  name: string;
  token: string;
  beginNumber?: string | null;
  paymentIds?: string[];
  paymentTypes?: PosPaymentType[];
};

type PosPaymentType = { type: string; title?: string; formField?: string };

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

const readConfig = (config: any): TPosOrderErkhetConfig => {
  const value = parseConfigValue(config.value);

  return {
    _id: config._id,
    subId: config.subId,
    ...value,
    reverseVatRules: toArrayValue(value.reverseVatRules),
    reverseCtaxRules: toArrayValue(value.reverseCtaxRules),
    accounts: value.accounts || value.account || '',
    locations: value.locations || value.location || '',
    cashAmount: value.cashAmount || value.cash || 'cashAmount',
    mobileAmount: value.mobileAmount || value.bank || 'mobileAmount',
  };
};

const writeConfig = (data: TPosOrderErkhetConfig) => {
  const {
    _id,
    subId,
    reverseVatRules,
    reverseCtaxRules,
    accounts,
    locations,
    ...value
  } = data;

  return {
    ...value,
    isSyncErkhet: true,
    accounts,
    locations,
    account: accounts,
    location: locations,
    reverseVatRules: value.hasVat ? toArrayValue(reverseVatRules) : [],
    reverseCtaxRules: value.hasCitytax ? [] : toArrayValue(reverseCtaxRules),
  };
};

export const usePosOrderErkhetConfigs = () => {
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const { data, loading, refetch } = useQuery(GET_MN_CONFIGS, {
    variables: { code: POS_ORDER_ERKHET_CONFIG_CODE },
    fetchPolicy: 'cache-and-network',
  });

  const { data: posData, loading: posLoading } = useQuery(GET_POS_LIST, {
    fetchPolicy: 'cache-and-network',
  });

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_MN_CONFIG,
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
    UPDATE_MN_CONFIG,
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
    REMOVE_MN_CONFIG,
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
  const poss: TPos[] = compactList(posData?.posList).flatMap((pos) => {
    if (!pos._id) {
      return [];
    }

    const posPaymentTypes = jsonRecords<PosPaymentType>(pos.paymentTypes);
    const otherPaymentTypes = posPaymentTypes.filter(
      (paymentType) =>
        !['cashAmount', 'mobileAmount'].includes(paymentType.type),
    );

    const paymentIds = compactList(pos.paymentIds);

    return {
      _id: pos._id,
      name: pos.name ?? '',
      token: pos.token ?? '',
      beginNumber: pos.beginNumber,
      paymentIds,
      paymentTypes: [
        {
          type: 'cashAmount',
          title: 'Бэлнээр',
          formField: 'cashAmount',
        },
        ...(paymentIds.length
          ? [
              {
                type: 'mobileAmount',
                title: 'Цахимаар',
                formField: 'mobileAmount',
              },
            ]
          : []),
        ...otherPaymentTypes,
      ],
    };
  });

  const saveConfig = async (data: TPosOrderErkhetConfig) => {
    const value = writeConfig(data);

    if (data._id) {
      await updateConfig({
        variables: { id: data._id, subId: value.posId, value },
      });
      toast({
        title: t('success'),
        description: t('config-updated-successfully'),
      });
    } else {
      await createConfig({
        variables: {
          code: POS_ORDER_ERKHET_CONFIG_CODE,
          subId: value.posId,
          value,
        },
      });
      toast({
        title: t('success'),
        description: t('config-created-successfully'),
      });
    }

    await refetch();
  };

  const deleteConfig = async (id: string) => {
    await removeConfig({ variables: { id } });
    await refetch();
    toast({
      title: t('success'),
      description: t('config-deleted-successfully'),
    });
  };

  const deleteManyConfigs = async (ids: string[]) => {
    await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
    await refetch();
    toast({
      title: t('success'),
      description: t('configs-deleted', { count: ids.length }),
    });
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
