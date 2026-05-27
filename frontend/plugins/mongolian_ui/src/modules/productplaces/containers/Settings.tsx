import { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Spinner, Form, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';

import type {
  MNConfigsCreateMutationResponse,
  MNConfigsUpdateMutationResponse,
  MNConfigsRemoveMutationResponse,
} from '../types';

import { MN_CONFIG, MN_CONFIGS } from '../graphql/clientQueries';
import {
  MN_CONFIGS_CREATE,
  MN_CONFIGS_UPDATE,
  MN_CONFIGS_REMOVE,
} from '../graphql/clientMutations';

import {
  normalizeConfig,
  denormalizeConfig,
  normalizePlaceConfig,
  normalizeSplitConfig,
  normalizePrintConfig,
} from '../configUtils';

type Props = {
  component: React.ComponentType<any>;
  configCode: string;
  subId?: string;
  multiple?: boolean;
};

const SettingsContainer = ({
  component: Component,
  configCode,
  subId,
  multiple = false,
}: Props) => {
  const { toast } = useToast();
  const form = useForm();

  const { data, loading, error, refetch } = useQuery(
    multiple ? MN_CONFIGS : MN_CONFIG,
    {
      variables: multiple
        ? { code: configCode }
        : { code: configCode, subId: subId ?? '' },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  );

  const [createConfig] =
    useMutation<MNConfigsCreateMutationResponse>(MN_CONFIGS_CREATE);

  const [updateConfig] =
    useMutation<MNConfigsUpdateMutationResponse>(MN_CONFIGS_UPDATE);

  const [removeConfig] =
    useMutation<MNConfigsRemoveMutationResponse>(MN_CONFIGS_REMOVE);

  const normalizedConfigs = useMemo(() => {
    if (multiple) {
      const rawList = data?.mnConfigs || [];

      return rawList.map((raw: any) => {
        let normalized;

        if (configCode === 'dealsProductsDataPlaces') {
          normalized = normalizePlaceConfig(raw);
        } else if (configCode === 'dealsProductsDataSplit') {
          normalized = normalizeSplitConfig(raw);
        } else if (configCode === 'dealsProductsDataPrint') {
          normalized = normalizePrintConfig(raw);
        } else {
          normalized = normalizeConfig(raw);
        }

        return {
          _id: raw._id,
          subId: raw.subId,
          ...normalized,
        };
      });
    }

    const raw = data?.mnConfig;

    if (!raw?.value) return [];

    let normalized;

    if (configCode === 'dealsProductsDataPlaces') {
      normalized = normalizePlaceConfig(raw);
    } else if (configCode === 'dealsProductsDataSplit') {
      normalized = normalizeSplitConfig(raw);
    } else if (configCode === 'dealsProductsDataPrint') {
      normalized = normalizePrintConfig(raw);
    } else {
      normalized = normalizeConfig(raw);
    }

    return [
      {
        _id: raw._id,
        subId: raw.subId,
        ...normalized,
      },
    ];
  }, [data, configCode, multiple]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-sm text-muted-foreground">
            Loading configurations...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error loading configuration: {error.message}
      </div>
    );
  }

  const save = async (config: Record<string, any>, formSubId?: string) => {
    try {
      const { _id, ...rest } = config;
      const value = denormalizeConfig(rest);

      const finalSubId = formSubId ?? rest.stageId ?? subId ?? '';

      if (_id) {
        await updateConfig({
          variables: {
            _id,
            subId: finalSubId,
            value,
          },
        });
        toast({
          title: 'Амжилттай',
          description: 'Тохиргоо амжилттай шинэчлэгдсэн',
          variant: 'default',
        });
      } else {
        await createConfig({
          variables: {
            code: configCode,
            subId: finalSubId,
            value,
          },
        });
        toast({
          title: 'Амжилттай',
          description: 'Тохиргоо амжилттай үүсгэгдсэн',
          variant: 'default',
        });
      }

      await refetch();
      return true;
    } catch (error: any) {
      toast({
        title: 'Алдаа',
        description: error?.message || 'Тохиргоо хадгалахад алдаа гарлаа',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      if (!id) return;

      await removeConfig({
        variables: { _id: id },
      });

      toast({
        title: 'Амжилттай',
        description: 'Тохиргоо амжилттай устгагдсан',
        variant: 'default',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Алдаа',
        description: error?.message || 'Тохиргоо устгахад алдаа гарлаа',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <Form {...form}>
      <Component
        configs={normalizedConfigs}
        save={save}
        delete={remove}
        loading={loading}
      />
    </Form>
  );
};

export default SettingsContainer;
