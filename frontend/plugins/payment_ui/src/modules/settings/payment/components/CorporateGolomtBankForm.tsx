import { gql, useQuery } from '@apollo/client';
import { Form, Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { ConfigSelectField } from './ConfigSelectField';
import { IPaymentDocument } from '../../../payment/types/Payment';

const CONFIGS_QUERY = gql`
  query GolomtBankConfigsList($page: Int, $perPage: Int) {
    golomtBankConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        name
        accountId
      }
      totalCount
    }
  }
`;

type Config = {
  _id: string;
  name: string;
  accountId: string;
};

type QueryResponse = {
  golomtBankConfigsList: {
    list: Config[];
    totalCount: number;
  };
};

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<any>;
};

const CorporateGolomtBankForm: React.FC<Props> = ({ payment, form }) => {
  const { t } = useTranslation('payment');

  const { watch, setValue, control } = form;

  const configId = watch('configId');

  const { data, loading } = useQuery<QueryResponse>(CONFIGS_QUERY, {
    variables: {
      page: 1,
      perPage: 999,
    },
  });

  const configs = data?.golomtBankConfigsList?.list ?? [];

  const selectedConfig = configs.find((config) => config._id === configId);

  React.useEffect(() => {
    if (!payment?.config) {
      return;
    }

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  React.useEffect(() => {
    if (!configId) {
      setValue('accountId', '');
      return;
    }

    setValue('accountId', selectedConfig?.accountId ?? '');
  }, [configId, selectedConfig, setValue]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <ConfigSelectField control={control} configs={configs} />

      <input type="hidden" {...form.register('accountId')} />

      <div className="col-span-2">
      </div>
    </>
  );
};

export default CorporateGolomtBankForm;