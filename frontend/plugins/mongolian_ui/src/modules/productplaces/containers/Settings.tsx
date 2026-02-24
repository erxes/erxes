import React, { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Spinner } from 'erxes-ui';

import type {
  MNConfigQueryResponse,
  MNConfigsCreateMutationResponse,
  MNConfigsUpdateMutationResponse,
  MNConfigsRemoveMutationResponse,
} from '../types';

import { MN_CONFIG } from '../graphql/clientQueries';
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
};

const SettingsContainer = ({
  component: Component,
  configCode,
  subId,
}: Props) => {
  const { data, loading, error, refetch } = useQuery<MNConfigQueryResponse>(
    MN_CONFIG,
    {
      variables: {
        code: configCode,
        subId: subId ?? '',
      },
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

  /**
   * Normalize ALL configs into array
   */
  const normalizedConfig = useMemo(() => {
    const raw = data?.mnConfig;

    if (!raw?.value) return null;

    try {
      let normalized: Record<string, any>;

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
        ...normalized,
      };
    } catch (err) {
      console.error(`[SettingsContainer:${configCode}] normalize failed`, err);
      return null;
    }
  }, [data, configCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error && !data?.mnConfig) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error loading configuration: {error.message}
      </div>
    );
  }

  /**
   * SAVE (create or update)
   */
  const save = async (config: Record<string, any>) => {
    const { _id, ...rest } = config;
    const value = denormalizeConfig(rest);

    if (_id) {
      await updateConfig({
        variables: {
          _id,
          subId: subId ?? '',
          value,
        },
      });
    } else {
      await createConfig({
        variables: {
          code: configCode,
          subId: subId ?? '',
          value,
        },
      });
    }

    await refetch();
    return true;
  };

  /**
   * DELETE by id
   */
  const remove = async (id: string) => {
    if (!id) return;

    await removeConfig({
      variables: { _id: id },
    });

    await refetch();
  };

  return <Component config={normalizedConfig} save={save} delete={remove} />;
};

export default SettingsContainer;
